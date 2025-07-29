// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth, adminRealtimeDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { getUserProfile } from '@/lib/db/queries';

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(2, "At least two participants are required."),
  title: z.string().optional(),
  participantNames: z.record(z.string()),
  isSupportChat: z.boolean().optional(),
});

// Helper to verify that the requester is one of the participants OR an admin
async function verifyAccess(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', requesterId: null, isAdmin: false };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        const isAdmin = user?.role === 'admin';
        
        return { authorized: true, requesterId: decodedToken.uid, isAdmin };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized', requesterId: null, isAdmin: false };
    }
}

function generateConversationId(participantIds: string[]): string {
    return participantIds.sort().join('-');
}

export async function GET(request: Request) {
    const accessCheck = await verifyAccess(request);
    if (!accessCheck.authorized || !accessCheck.requesterId) {
        return NextResponse.json({ message: accessCheck.message }, { status: 403 });
    }
    
    const db = adminRealtimeDb;
    try {
        let conversations;
        if (accessCheck.isAdmin) {
            // Admin fetches all conversations
            const convosRef = db.ref('conversations');
            const snapshot = await convosRef.get();
            conversations = snapshot.val() || {};
        } else {
            // User fetches their own conversations
            const userConvoRef = db.ref(`userConversations/${accessCheck.requesterId}`);
            const userConvoSnapshot = await userConvoRef.get();
            const conversationIds = userConvoSnapshot.val() ? Object.keys(userConvoSnapshot.val()) : [];
            
            if (conversationIds.length === 0) {
                 return NextResponse.json([], { status: 200 });
            }

            const convoPromises = conversationIds.map(id => db.ref(`conversations/${id}`).get());
            const convoSnapshots = await Promise.all(convoPromises);
            conversations = convoSnapshots.reduce((acc, snap) => {
                if (snap.exists()) {
                    acc[snap.key!] = snap.val();
                }
                return acc;
            }, {} as Record<string, any>);
        }

        const conversationsArray = Object.values(conversations);
        return NextResponse.json(conversationsArray, { status: 200 });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = createConversationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { participantIds, title, participantNames, isSupportChat } = validation.data;
        
        const accessCheck = await verifyAccess(request);
        if (!accessCheck.authorized || !accessCheck.requesterId) {
            return NextResponse.json({ message: accessCheck.message }, { status: 403 });
        }

        // Ensure the creator is part of the conversation
        if (!participantIds.includes(accessCheck.requesterId)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const conversationId = generateConversationId(participantIds);
        const db = adminRealtimeDb;
        
        const conversationRef = db.ref(`conversations/${conversationId}`);
        const snapshot = await conversationRef.get();

        if (snapshot.exists()) {
             return NextResponse.json(snapshot.val(), { status: 200 });
        }
        
        const now = new Date().toISOString();
        const newConversation = {
            id: conversationId,
            participantIds,
            createdAt: now,
            lastMessage: "Conversation started.",
            lastMessageTimestamp: now,
            title: title || 'New Chat',
            participantNames,
            isSupportChat: isSupportChat || false,
            messages: [], // Initialize with an empty messages array
        };

        const updates: { [key: string]: any } = {};
        updates[`/conversations/${conversationId}`] = newConversation;
        participantIds.forEach(id => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await db.ref().update(updates);
        
        return NextResponse.json(newConversation, { status: 201 });

    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

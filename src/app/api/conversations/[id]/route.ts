// src/app/api/conversations/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminRealtimeDb } from '@/lib/firebase/server-init';

// Helper to verify user can delete the conversation
async function verifyAccess(request: Request, conversationId: string) {
    const adminAuth = await getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', requesterId: null, conversation: null };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const requesterId = decodedToken.uid;

        const db = adminRealtimeDb;
        const convoSnapshot = await db.ref(`conversations/${conversationId}`).get();
        if (!convoSnapshot.exists()) {
            return { authorized: false, message: 'Conversation not found', requesterId, conversation: null };
        }
        const conversation = convoSnapshot.val();
        
        if (!conversation.participantIds.includes(requesterId)) {
             return { authorized: false, message: 'Forbidden', requesterId, conversation: null };
        }

        return { authorized: true, requesterId, conversation };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized', requesterId: null, conversation: null };
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const conversationId = params.id;
    try {
        const accessCheck = await verifyAccess(request, conversationId);
        if (!accessCheck.authorized || !accessCheck.requesterId || !accessCheck.conversation) {
            // Even if convo not found, we might want to let the client proceed as if deleted
            if (accessCheck.message === 'Conversation not found') {
                 return NextResponse.json({ message: 'Conversation already deleted.' }, { status: 200 });
            }
            return NextResponse.json({ message: accessCheck.message }, { status: 403 });
        }

        const db = adminRealtimeDb;
        const { participantIds } = accessCheck.conversation;

        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        participantIds.forEach((id: string) => {
            updates[`/userConversations/${id}/${conversationId}`] = null;
        });

        await db.ref().update(updates);

        return NextResponse.json({ message: 'Conversation deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

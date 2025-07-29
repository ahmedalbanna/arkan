
import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';

export async function POST(request: Request) {
    const adminAuth = await getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;
        
        const userProfile = await getUserProfile(userId);
        if (!userProfile) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }

        // Find all admins
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            return NextResponse.json({ message: 'No support admins available.' }, { status: 503 });
        }

        const adminIds = adminsSnapshot.docs.map(doc => doc.id);
        const adminNames = adminsSnapshot.docs.reduce((acc, doc) => ({...acc, [doc.id]: doc.data().name }), {});
        
        const participantIds = [userId, ...adminIds];
        const participantNames = {
            [userId]: userProfile.name,
            ...adminNames
        };
        
        const db = adminRealtimeDb;
        const newConversationRef = db.ref('conversations').push(); // Generate a unique ID
        const conversationId = newConversationRef.key;

        if (!conversationId) {
            throw new Error("Failed to generate a unique conversation ID.");
        }
        
        const now = new Date().toISOString();
        const newConversation = {
            id: conversationId,
            participantIds,
            createdAt: now,
            lastMessage: "Support chat initiated.",
            lastMessageTimestamp: now,
            title: `Support: ${userProfile.name}`,
            participantNames,
            isSupportChat: true, // Flag to identify support chats
        };

        const updates: { [key: string]: any } = {};
        updates[`/conversations/${conversationId}`] = newConversation;
        participantIds.forEach(id => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await db.ref().update(updates);
        
        return NextResponse.json(newConversation, { status: 201 });

    } catch (error) {
        console.error('Error initiating support chat:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

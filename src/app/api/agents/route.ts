
// src/app/api/agents/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { AGENTS as defaultAgents } from '@/lib/agents';

// Helper to verify admin role from Authorization header
async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true, userId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

// GET /api/agents
export async function GET(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const agentsCollection = adminDb.collection('agents');
        let snapshot = await agentsCollection.get();

        // Lazy seeding: If no agents exist, populate them from the default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultAgents.forEach(agent => {
                const docRef = agentsCollection.doc(agent.id);
                // We only store data that can be modified, not the icon or other static parts.
                const { icon, ...agentData } = agent;
                batch.set(docRef, agentData);
            });
            await batch.commit();
            snapshot = await agentsCollection.get(); // Re-fetch after seeding
        }
        
        const agents = snapshot.docs.map(doc => {
            const data = doc.data();
            // Re-hydrate with the icon from the default config
            const defaultAgent = defaultAgents.find(a => a.id === doc.id);
            return {
                ...data,
                id: doc.id,
                icon: defaultAgent?.icon,
            };
        });

        return NextResponse.json(agents, { status: 200 });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return NextResponse.json({ message: 'An unexpected error occurred while fetching agents.' }, { status: 500 });
    }
}

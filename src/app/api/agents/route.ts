
// src/app/api/agents/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
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


const createAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  pageUrl: z.string().min(1, "Page URL is required"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});


// POST /api/agents
export async function POST(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const body = await request.json();
        const validation = createAgentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, ...agentData } = validation.data;
        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            return NextResponse.json({ errors: { id: ["An agent with this ID already exists."] } }, { status: 409 });
        }

        const newAgent = {
            ...agentData,
            isEnabled: true, // New agents are enabled by default
        };

        await agentRef.set(newAgent);
        
        return NextResponse.json({ id: agentRef.id, ...newAgent }, { status: 201 });

    } catch (error) {
        console.error('Error creating agent:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

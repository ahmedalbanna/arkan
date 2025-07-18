
// src/app/api/agents/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { AGENTS } from '@/lib/agents';

async function verifyAdmin(request: Request) {
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

// GET /api/agents/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const agentDoc = await adminDb.collection('agents').doc(params.id).get();
        if (!agentDoc.exists) {
            return NextResponse.json({ message: 'Agent not found.' }, { status: 404 });
        }
        
        const data = agentDoc.data();
        const defaultAgent = AGENTS.find(a => a.id === params.id);
        
        return NextResponse.json({ ...data, id: agentDoc.id, icon: defaultAgent?.icon }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching agent ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// PUT /api/agents/[id]
const updateAgentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").optional(),
  isEnabled: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const agentRef = adminDb.collection('agents').doc(params.id);
        const agentDoc = await agentRef.get();
        if (!agentDoc.exists) {
            return NextResponse.json({ message: 'Agent not found.' }, { status: 404 });
        }
        
        const body = await request.json();
        const validation = updateAgentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const currentAgentData = agentDoc.data();
        const updateData: any = {};

        if (validation.data.name) updateData.name = validation.data.name;
        if (validation.data.isEnabled !== undefined) updateData.isEnabled = validation.data.isEnabled;
        
        if (validation.data.prompt) {
            // Check if the prompt is simple or complex and update accordingly
            if (typeof currentAgentData?.prompt === 'object') {
                updateData.prompt = { ...currentAgentData.prompt, base: validation.data.prompt };
            } else {
                updateData.prompt = validation.data.prompt;
            }
        }
        
        await agentRef.update(updateData);
        const updatedDoc = await agentRef.get();
        const defaultAgent = AGENTS.find(a => a.id === params.id);
        
        return NextResponse.json({ ...updatedDoc.data(), icon: defaultAgent?.icon }, { status: 200 });

    } catch (error) {
        console.error(`Error updating agent ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

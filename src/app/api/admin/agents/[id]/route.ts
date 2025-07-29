
// src/app/api/agents/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { AGENTS } from '@/lib/agents';

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

// GET /api/agents/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const agentId = params.id;
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const agentDoc = await adminDb.collection("agents").doc(agentId).get();
        if (!agentDoc.exists) {
            return NextResponse.json({ message: 'Agent not found.' }, { status: 404 });
        }

        const data = agentDoc.data();
        const defaultAgent = AGENTS.find((a) => a.id === agentId);

        return NextResponse.json({ ...data, id: agentDoc.id, icon: defaultAgent?.icon }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching agent ${agentId}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


const agentGuidelineSchema = z.object({
  text: z.string().min(1),
  isDefault: z.boolean(),
});

const agentPromptSchema = z.object({
  base: z.string().min(1),
  guidelines: z.array(agentGuidelineSchema).optional(),
  jsonStructure: z.any().optional(),
});

// PUT /api/agents/[id]
const updateAgentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  prompt: z.union([z.string().min(10), agentPromptSchema]).optional(),
  isEnabled: z.boolean().optional(),
});


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const agentId = params.id;
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const agentRef = adminDb.collection('agents').doc(agentId);
        const agentDoc = await agentRef.get();
        if (!agentDoc.exists) {
            return NextResponse.json({ message: 'Agent not found.' }, { status: 404 });
        }

        const body = await request.json();
        const validation = updateAgentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const updateData: any = {};

        if (validation.data.name) updateData.name = validation.data.name;
        if (validation.data.isEnabled !== undefined) updateData.isEnabled = validation.data.isEnabled;
        if (validation.data.prompt) updateData.prompt = validation.data.prompt;


        await agentRef.update(updateData);
        const updatedDoc = await agentRef.get();

        const defaultAgent = AGENTS.find(a => a.id === agentId);

        return NextResponse.json({ ...updatedDoc.data(), icon: defaultAgent?.icon }, { status: 200 });

    } catch (error) {
        console.error(`Error updating agent ${agentId}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

// DELETE /api/agents/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const agentId = params.id;
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    // Prevent deletion of default agents
    const isDefaultAgent = AGENTS.some(agent => agent.id === agentId);
    if (isDefaultAgent) {
        return NextResponse.json({ message: 'Default agents cannot be deleted.' }, { status: 403 });
    }

    try {
        const agentRef = adminDb.collection('agents').doc(agentId);
        const doc = await agentRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: 'Agent not found.' }, { status: 404 });
        }
        
        await agentRef.delete();

        return NextResponse.json({ message: `Agent '${agentId}' deleted successfully.` }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting agent ${agentId}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

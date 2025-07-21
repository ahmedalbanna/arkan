// src/app/api/templates/presentation/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, auth as adminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';

async function verifyAdmin(request: Request) {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return { authorized: false, message: 'Unauthorized' };
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') return { authorized: false, message: 'Forbidden' };
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  primaryAgentId: z.string().optional(),
  relevantReportSectionIds: z.array(z.string()).optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { id } = params;
    try {
        const templateRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        const body = await request.json();
        const validation = updateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        await templateRef.update({ ...validation.data, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();
        
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });

    } catch (error) {
        console.error(`Error updating presentation template ${id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

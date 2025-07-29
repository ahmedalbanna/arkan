
// src/app/api/templates/report/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';

async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
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
  agentIds: z.array(z.string()).min(1, "At least one agent ID is required.").optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { id } = params;
    try {
        const templateRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
        const body = await request.json();
        const validation = updateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        await templateRef.update({ ...validation.data, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();
        
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });

    } catch (error) {
        console.error(`Error updating report template ${id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { id } = params;

    // Protect default templates
    if (REPORT_GENERATION_TEMPLATES.some(t => t.id === id)) {
        return NextResponse.json({ message: 'Default templates cannot be deleted.' }, { status: 403 });
    }

    try {
        const templateRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
        const doc = await templateRef.get();
        if (!doc.exists) {
            return NextResponse.json({ message: 'Template not found.' }, { status: 404 });
        }
        
        await templateRef.delete();
        
        return NextResponse.json({ message: `Template "${id}" deleted successfully.` }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting report template ${id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

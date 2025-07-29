
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = await getAdminAuth();
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
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

// Minimal validation for the styles object. A full Zod schema would be very complex.
const updateDocxTemplateSchema = z.object({
  styles: z.object({}).passthrough(), // Allows any object shape for styles
});


export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { key } = params;
    if (!key) {
        return NextResponse.json({ message: 'Template key is required.' }, { status: 400 });
    }

    try {
        const templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return NextResponse.json({ message: 'DOCX template not found.' }, { status: 404 });
        }
        
        const body = await request.json();
        const validation = updateDocxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        await templateRef.update({ styles: validation.data.styles, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();
        
        return NextResponse.json(updatedDoc.data(), { status: 200 });

    } catch (error) {
        console.error(`Error updating DOCX template ${key}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { key } = params;
    if (!key) {
        return NextResponse.json({ message: 'Template key is required.' }, { status: 400 });
    }

    // Protect default templates from deletion
    if (['modern', 'classic', 'academic'].includes(key)) {
        return NextResponse.json({ message: 'Default templates cannot be deleted.' }, { status: 403 });
    }

    try {
        const templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return NextResponse.json({ message: 'DOCX template not found.' }, { status: 404 });
        }
        
        await templateRef.delete();
        
        return NextResponse.json({ message: `Template "${key}" deleted successfully.` }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting DOCX template ${key}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

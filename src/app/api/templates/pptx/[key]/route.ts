
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';

// Helper to verify admin role
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
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}


const updatePptxTemplateSchema = z.object({
  styles: z.object({}).passthrough(),
});


export async function PUT(request: Request, { params }: { params: { key: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }
    
    const { key } = params;
    if (!key) {
        return NextResponse.json({ message: 'Template key is required.' }, { status: 400 });
    }

    try {
        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return NextResponse.json({ message: 'PPTX template not found.' }, { status: 404 });
        }
        
        const body = await request.json();
        const validation = updatePptxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        await templateRef.update({ styles: validation.data.styles, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();
        
        return NextResponse.json(updatedDoc.data(), { status: 200 });

    } catch (error) {
        console.error(`Error updating PPTX template ${key}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

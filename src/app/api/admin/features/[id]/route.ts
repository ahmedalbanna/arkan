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


const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: 'Feature ID is required.' }, { status: 400 });
    }

    try {
        const featureRef = adminDb.collection('features').doc(id);
        const featureDoc = await featureRef.get();

        if (!featureDoc.exists) {
            return NextResponse.json({ message: 'Feature not found.' }, { status: 404 });
        }
        
        const body = await request.json();
        const validation = updateFeatureSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        await featureRef.update({ isEnabled: validation.data.isEnabled });
        const updatedDoc = await featureRef.get();
        
        return NextResponse.json(updatedDoc.data(), { status: 200 });

    } catch (error) {
        console.error(`Error updating feature ${id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

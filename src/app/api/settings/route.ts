
import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { z } from 'zod';

// Helper to verify admin role
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
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

// GET /api/settings
export async function GET(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const settingsRef = adminDb.collection('settings').doc('defaults');
        const doc = await settingsRef.get();
        if (!doc.exists) {
            // If settings don't exist, create them with default values
            const defaultSettings = { newUserCredits: 10 };
            await settingsRef.set(defaultSettings);
            return NextResponse.json(defaultSettings, { status: 200 });
        }
        return NextResponse.json(doc.data(), { status: 200 });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// PUT /api/settings
const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
});

export async function PUT(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const body = await request.json();
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(validation.data, { merge: true });
        
        return NextResponse.json(validation.data, { status: 200 });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

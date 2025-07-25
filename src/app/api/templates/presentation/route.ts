// src/app/api/templates/presentation/route.ts
import { NextResponse } from 'next/server';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { PRESENTATION_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/presentation-generation-templates';
import { z } from 'zod';
import { getUserProfile } from '@/lib/db/queries';


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


export async function GET(request: Request) {
    try {
        const collectionRef = adminDb.collection('templates').doc('presentation').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            console.log('No presentation templates found in Firestore, seeding...');
            const batch = adminDb.batch();
            defaultTemplates.forEach(template => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            console.log('Presentation templates seeded successfully.');
            snapshot = await collectionRef.get();
        }
        
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error('Error fetching presentation templates:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


const createSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  primaryAgentId: z.string().default('generate-presentation'),
  relevantReportSectionIds: z.array(z.string()).optional(),
});


export async function POST(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const body = await request.json();
        const validation = createSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, ...data } = validation.data;

        const docRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            return NextResponse.json({ errors: { id: ["A template with this ID already exists."] } }, { status: 409 });
        }

        const newTemplate = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
        };

        await docRef.set(newTemplate);

        return NextResponse.json({ id: docRef.id, ...newTemplate }, { status: 201 });
    } catch (error) {
        console.error('Error creating presentation template:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
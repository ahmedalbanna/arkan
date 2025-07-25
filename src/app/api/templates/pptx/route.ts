
import { NextResponse } from 'next/server';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
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

// This endpoint is public and does not require authentication
// as all users need to be able to fetch the templates for exporting.
export async function GET(request: Request) {
    try {
        const stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (snapshot.empty) {
            console.log('No PPTX templates found in Firestore, seeding...');
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as PptxTemplateKey[]).forEach(key => {
                const template = defaultTemplates[key];
                const docRef = stylesCollection.doc(key);
                batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
            });
            await batch.commit();
            console.log('PPTX templates seeded successfully.');
            snapshot = await stylesCollection.get(); // Re-fetch after seeding
        }
        
        const templates: { [key: string]: any } = {};
        snapshot.docs.forEach(doc => {
            templates[doc.id] = doc.data();
        });

        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error('Error fetching PPTX templates:', error);
        return NextResponse.json({ message: 'An unexpected error occurred while fetching PPTX templates.' }, { status: 500 });
    }
}

const createSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
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
        
        const { id, name, description } = validation.data;
        const stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        const docRef = stylesCollection.doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            return NextResponse.json({ errors: { id: ["A template with this ID already exists."] } }, { status: 409 });
        }

        const newTemplate = {
            id,
            name,
            description,
            styles: defaultTemplates.modern.styles, // Start with modern styles as a base
            imageUrl: '',
            dataAiHint: 'presentation abstract',
            createdAt: new Date().toISOString(),
        };

        await docRef.set(newTemplate);

        return NextResponse.json(newTemplate, { status: 201 });
    } catch (error) {
        console.error('Error creating PPTX template:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}

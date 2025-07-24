
'use server';

import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import type { HomeworkHistoryEntry } from '@/services/homework-service';
import { FieldValue } from 'firebase-admin/firestore';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

// GET /api/homework-solver/history
export async function GET(request: Request) {
    const adminAuth = getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const historySnapshot = await adminDb.collection('homework_history').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
        const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HomeworkHistoryEntry[];

        return NextResponse.json(history, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching homework history:", error);
        return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}


// POST /api/homework-solver/history
export async function POST(request: Request) {
    const adminAuth = getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const formData = await request.formData();
        
        const analyzedHomework = formData.get('analyzedHomework') ? JSON.parse(formData.get('analyzedHomework') as string) : null;
        const solvedHomework = formData.get('solvedHomework') ? JSON.parse(formData.get('solvedHomework') as string) : null;
        const homeworkFiles = formData.getAll('homeworkFiles') as File[];
        const curriculumFiles = formData.getAll('curriculumFiles') as File[];

        const storage = getStorage();
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');

        const uploadFile = async (file: File, type: 'homework' | 'curriculum') => {
            if (!file || file.size === 0) return null;
            const fileName = `homework_files/${userId}/${type}/${Date.now()}-${file.name}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const fileRef = bucket.file(fileName);
            
            await fileRef.save(fileBuffer, { metadata: { contentType: file.type } });
            await fileRef.makePublic();
            
            return { name: file.name, type: file.type, url: fileRef.publicUrl() };
        };
        
        const [homeworkFileUrls, curriculumFileUrls] = await Promise.all([
            Promise.all(homeworkFiles.map(file => uploadFile(file, 'homework'))),
            Promise.all(curriculumFiles.map(file => uploadFile(file, 'curriculum')))
        ]);
        
        const historyEntry: Omit<HomeworkHistoryEntry, 'id'> = {
            userId,
            analyzedHomework,
            solvedHomework,
            homeworkFiles: homeworkFileUrls.filter(u => u !== null) as any,
            curriculumFiles: curriculumFileUrls.filter(u => u !== null) as any,
            createdAt: new Date().toISOString(),
        };

        const newDocRef = await adminDb.collection('homework_history').add(historyEntry);

        return NextResponse.json({ id: newDocRef.id, ...historyEntry }, { status: 201 });

    } catch (error: any) {
        console.error("Error saving homework history:", error);
        return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}


// DELETE /api/homework-solver/history
export async function DELETE(request: Request) {
    const adminAuth = getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const historyCollectionRef = adminDb.collection('homework_history');
        const snapshot = await historyCollectionRef.where('userId', '==', userId).get();
        
        if (snapshot.empty) {
            return NextResponse.json({ message: 'History already empty.' }, { status: 200 });
        }

        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return NextResponse.json({ message: 'History cleared successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error("Error clearing homework history:", error);
        return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}

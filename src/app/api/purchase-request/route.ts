// src/app/api/purchase-request/route.ts
import { NextResponse } from 'next/server';
import { adminDb, auth as adminAuth } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { Formidable } from 'formidable';
import fs from 'fs';
import { createTransaction } from '@/lib/db/queries';

export const config = {
    api: {
        bodyParser: false,
    },
};

// This function correctly adapts formidable to work with Next.js API route requests.
const parseForm = async (req: Request): Promise<{ fields: any; files: any }> => {
    const formData = await req.formData();
    const fields: Record<string, any> = {};
    const files: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // formidable expects a specific structure for files
            files[key] = [{
                filepath: value.path, // a temporary path, may need adjustment in some environments
                originalFilename: value.name,
                mimetype: value.type,
                size: value.size,
                // A way to read the file content
                toBuffer: () => value.arrayBuffer().then(ab => Buffer.from(ab)),
            }];
        } else {
            // formidable expects field values to be arrays
            if (!fields[key]) {
                fields[key] = [];
            }
            fields[key].push(value);
        }
    }
    
    // We need to read the file into a temporary location for formidable to process it,
    // or handle the buffer directly. The updated logic below handles the buffer directly.
    return { fields, files };
};

export async function POST(request: Request) {
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        await adminAuth.verifyIdToken(token, true);

        const { fields, files } = await parseForm(request);

        const file = files.file?.[0];
        const { userId, planId, planName, credits, price, userName, userEmail } = fields;

        if (!file || !userId?.[0] || !planId?.[0] || !credits?.[0] || !price?.[0]) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const storage = getStorage();
        const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
        const fileName = `payment_proofs/${userId[0]}/${Date.now()}-${file.originalFilename}`;
        
        const fileBuffer = Buffer.from(await file.toBuffer());

        await bucket.file(fileName).save(fileBuffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });

        const [fileUrl] = await bucket.file(fileName).getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // A very distant future date
        });

        const transactionData = {
            userId: userId[0],
            planId: planId[0],
            planName: planName[0],
            credits: parseInt(credits[0], 10),
            price: parseFloat(price[0]),
            userName: userName[0] || 'N/A',
            userEmail: userEmail[0] || 'N/A',
            status: 'pending' as 'pending',
            proofUrl: fileUrl,
        };

        const { id: transactionId } = await createTransaction(transactionData);

        return NextResponse.json({ message: 'Request submitted successfully for review.', transactionId }, { status: 200 });

    } catch (error: any) {
        console.error("Purchase request error:", error);
        return NextResponse.json({ message: error.message || 'An error occurred during submission.' }, { status: 500 });
    }
}

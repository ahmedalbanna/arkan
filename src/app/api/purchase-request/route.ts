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

const parseForm = (req: Request): Promise<{ fields: any; files: any }> => {
    return new Promise((resolve, reject) => {
        const form = new Formidable({
            maxFiles: 1,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filter: part => part.name === 'file' && (part.mimetype?.includes('image') || part.mimetype === 'application/pdf') || false
        });
        
        // This is a workaround to adapt formidable to Next.js Edge runtime
        const chunks: Uint8Array[] = [];
        const reader = req.body!.getReader();
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              const buffer = Buffer.concat(chunks);
              form.parse(buffer as any, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
              });
              return;
            }
            chunks.push(value);
            read();
          });
        };
        read();
    });
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

        if (!file || !userId || !planId || !credits || !price) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const storage = getStorage();
        const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
        const fileName = `payment_proofs/${userId[0]}/${Date.now()}-${file.originalFilename}`;
        
        const fileBuffer = fs.readFileSync(file.filepath);

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
            userName: userName[0],
            userEmail: userEmail[0],
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

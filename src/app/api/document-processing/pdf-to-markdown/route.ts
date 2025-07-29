// src/app/api/document-processing/pdf-to-markdown/route.ts
import { NextResponse } from 'next/server';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

export async function POST(request: Request) {
  const auth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
        return NextResponse.json({ message: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    await deductCredit(userId, 2);

    const fileArrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(fileArrayBuffer).toString('base64');
    const pdfDataUri = `data:application/pdf;base64,${base64}`;
    
    const agentInput = { pdfDataUri };
    const result = await rewriteDocumentToMarkdown(agentInput);

    await logGeneration({
        agentId: 'pdf-to-markdown',
        userId,
        input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
        output: result,
    });

    return NextResponse.json({ markdown: result.markdown }, { status: 200 });

  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error instanceof Error && (error.message.includes("Unauthorized") || error.message.includes("token"))) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

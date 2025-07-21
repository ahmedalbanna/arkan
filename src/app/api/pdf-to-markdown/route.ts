
// src/app/api/pdf-to-markdown/route.ts
import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { rewriteToMarkdown } from '@/ai/flows/rewrite-to-markdown';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';

// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

async function extractContentFromPdf(fileBuffer: Uint8Array): Promise<{ text: string; images: string[] }> {
    const pdfDocument = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    let fullText = '';
    const imagePromises: Promise<string>[] = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';

        // Render page to canvas to get an image
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        if (context) {
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            await page.render(renderContext).promise;
            const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
            const reader = new FileReader();

            const dataUrlPromise = new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            imagePromises.push(dataUrlPromise);
        }
         page.cleanup();
    }
    const pageImages = await Promise.all(imagePromises);
    return { text: fullText, images: pageImages };
}


export async function POST(request: Request) {
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

    const fileArrayBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileArrayBuffer);
    
    // Credit deduction for the more complex operation
    await deductCredit(userId, 2);

    const { text, images } = await extractContentFromPdf(fileUint8Array);

    if (images.length === 0) {
        return NextResponse.json({ message: 'Could not extract any content from the PDF.' }, { status: 400 });
    }
    
    // Use the new multi-modal flow
    const result = await rewriteDocumentToMarkdown({ extractedText: text, pageImages: images });

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

    
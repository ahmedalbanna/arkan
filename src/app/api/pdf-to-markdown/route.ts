
// src/app/api/pdf-to-markdown/route.ts
import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';
import * as canvas from 'canvas';

// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

class NodeCanvasFactory {
    create(width: number, height: number) {
      const canv = canvas.createCanvas(width, height);
      const context = canv.getContext('2d');
      return {
        canvas: canv,
        context,
      };
    }
  
    reset(canvasAndContext: { canvas: any; context: any; }, width: number, height: number) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
  
    destroy(canvasAndContext: { canvas: any; context: any; }) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  }


async function extractContentFromPdf(fileBuffer: Uint8Array): Promise<{ text: string; images: string[] }> {
    const pdfDocument = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    let fullText = '';
    const imagePromises: Promise<string>[] = [];
    const canvasFactory = new NodeCanvasFactory();

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';

        // Render page to canvas to get an image
        const viewport = page.getViewport({ scale: 1.5 });
        const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
        
        const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport: viewport,
            canvasFactory: canvasFactory,
        };
        await page.render(renderContext).promise;
        const dataUrl = (canvasAndContext.canvas as any).toDataURL('image/jpeg', 0.8);
        imagePromises.push(Promise.resolve(dataUrl));

        page.cleanup();
        canvasFactory.destroy(canvasAndContext);
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

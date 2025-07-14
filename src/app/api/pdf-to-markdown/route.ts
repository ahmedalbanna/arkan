// src/app/api/pdf-to-markdown/route.ts
import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'; // Import as a library
import { rewriteToMarkdown } from '@/ai/flows/rewrite-to-markdown';
import { deductCredit } from '@/services/credit-service';

// This is a temporary solution for a stateless API route.
// In a real app, you'd get the user ID from the session/token.
const HARDCODED_USER_ID = 'user-1';

export async function POST(request: Request) {
  try {
    await deductCredit(HARDCODED_USER_ID, 1);
    
    const formData = await request.formData();
    const file = formData.get('file') as File; // Get the file using the name 'file' from the frontend FormData

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
        return NextResponse.json({ message: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    // Read the file into an ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileArrayBuffer);

    // --- Change starts here ---
    // Set the worker source globally for pdfjs-dist
    // This path might need adjustment based on your project's build output
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
    // --- Change ends here ---

    // Load the PDF document
    const pdfDocument = await pdfjsLib.getDocument({ data: fileUint8Array }).promise;

    let rawText = '';
    // Iterate over each page and extract text
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      rawText += textContent.items.map((item: any) => item.str).join(' ') + '\n'; // Join text items and add newline per page
    }

    if (!rawText || rawText.trim().length < 20) {
        return NextResponse.json({ message: 'Could not extract sufficient text from the PDF.' }, { status: 400 });
    }

    // Rewrite text to markdown using AI
    const result = await rewriteToMarkdown({ rawText });

    return NextResponse.json({ markdown: result.markdown }, { status: 200 });

  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

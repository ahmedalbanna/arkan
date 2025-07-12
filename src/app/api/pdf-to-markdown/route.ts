
import { NextResponse } from 'next/server';
import { formidable } from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import { rewriteToMarkdown } from '@/ai/flows/rewrite-to-markdown';

// We need to disable the default body parser to allow formidable to work
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const form = formidable({});
    const [fields, files] = await form.parse(request as any);
    
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (uploadedFile.mimetype !== 'application/pdf') {
        return NextResponse.json({ message: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    // Read the file buffer
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    
    // Extract text from PDF
    const data = await pdf(fileBuffer);
    const rawText = data.text;

    // Clean up temporary file
    await fs.unlink(uploadedFile.filepath);

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

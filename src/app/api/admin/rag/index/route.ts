/**
 * Admin Document Indexing API
 * 
 * Processes uploaded files and indexes them using:
 * - File extraction (PDF, DOCX, TXT, MD)
 * - Text chunking
 * - Ollama embeddings (nomic-embed-text)
 * - Qdrant storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

// File processing utilities
async function extractTextFromFile(file: File): Promise<string> {
  const filename = file.name.toLowerCase();
  
  // PDF files
  if (filename.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  }
  
  // DOCX files
  if (filename.endsWith('.docx')) {
    return await extractTextFromDOCX(file);
  }
  
  // Text/Markdown files
  if (filename.endsWith('.txt') || filename.endsWith('.md')) {
    return await file.text();
  }
  
  throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.');
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const options = { max: 0 };
    const buffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer), options);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}

async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const mammoth = require('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX.');
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData | null = null;
  const controller = container.resolve(RagController);

  try {
    formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string;
    const chunkSize = parseInt(formData.get('chunkSize') as string || '400');
    const overlap = parseInt(formData.get('overlap') as string || '50');
    const type = formData.get('type') as 'report' | 'reference' | 'context' | 'user_upload' || 'context';
    const userId = formData.get('userId') as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ success: false, error: 'File and Project ID are required' }, { status: 400 });
    }

    const text = await extractTextFromFile(file);
    const result = await controller.indexDocument(text, {
      projectId: projectId.trim(),
      userId: userId ? userId.trim() : undefined,
      sourceFile: file.name,
      type,
      chunkSize,
      overlap,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Indexing failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      chunksCreated: result.chunksCreated,
      fileName: file.name,
      message: 'Document indexed successfully',
    });

  } catch (error) {
    console.error('Document indexing error:', error);
    
    if (formData) {
        const file = formData.get('file') as File | null;
        const projectId = formData.get('projectId') as string;
        if (file && projectId) {
            await controller.recordFailedIndexing({
                projectId: projectId.trim(),
                userId: (formData.get('userId') as string) || undefined,
                sourceFile: file.name,
                fileSize: file.size,
                type: (formData.get('type') as any) || 'context',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure API route
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

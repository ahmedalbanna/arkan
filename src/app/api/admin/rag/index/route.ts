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
import { indexDocument } from '@/modules/rag/infrastructure/indexer';

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
    // Use pdf-parse library with custom canvas implementation
    const pdfParse = require('pdf-parse');
    
    // For server-side PDF parsing without canvas
    const options = {
      // Disable rendering to avoid canvas issues
      max: 0,
    };
    
    const buffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer), options);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // Provide more helpful error message
    if (error instanceof Error && error.message.includes('DOMMatrix')) {
      throw new Error('PDF extraction failed. Try converting to TXT first or use a simpler PDF.');
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted or try a different format.');
  }
}

async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Use mammoth library
    const mammoth = require('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX. Please ensure the file is not corrupted.');
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData | null = null;
  try {
    // Parse form data
    formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string;
    const chunkSize = parseInt(formData.get('chunkSize') as string || '400');
    const overlap = parseInt(formData.get('overlap') as string || '50');
    const type = formData.get('type') as 'report' | 'reference' | 'context' | 'user_upload' || 'context';
    const userId = formData.get('userId') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!projectId || projectId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log(`📄 Processing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    console.log(`   Project: ${projectId}`);
    console.log(`   Settings: chunkSize=${chunkSize}, overlap=${overlap}, type=${type}`);

    // Step 1: Extract text from file
    console.log('   Step 1: Extracting text...');
    const text = await extractTextFromFile(file);
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No text content found in file' },
        { status: 400 }
      );
    }

    console.log(`   ✓ Extracted ${text.length} characters`);

    // Step 2: Index document using Ollama + Qdrant
    console.log('   Step 2: Generating embeddings with Ollama (nomic-embed-text)...');
    console.log('   Step 3: Storing in Qdrant...');
    
    const result = await indexDocument(text, {
      projectId: projectId.trim(),
      userId: userId ? userId.trim() : undefined,
      sourceFile: file.name,
      type,
      chunkSize,
      overlap,
    });

    if (!result.success) {
      const errMsg = result.errors?.join(', ') || 'Indexing failed';
      console.error(`   ✗ Indexing failed: ${errMsg}`);
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 500 }
      );
    }

    console.log(`   ✓ Successfully indexed ${result.chunksCreated} chunks`);
    console.log(`   ✓ Total time: ~${result.chunksCreated * 0.5}s (estimate)`);

    // Step 4: Record in document tracking database
    try {
      const { recordIndexedDocument } = await import('@/modules/rag/infrastructure/document-tracking-service');
      await recordIndexedDocument({
        projectId: projectId.trim(),
        userId: userId ? userId.trim() : undefined,
        sourceFile: file.name,
        chunksCount: result.chunksCreated,
        fileSize: file.size,
        type,
        chunkSize,
        overlap,
      });
      console.log(`   ✓ Recorded in tracking database`);
    } catch (trackingError) {
      console.error('   ⚠️  Warning: Failed to record in tracking database:', trackingError);
      // Don't fail the whole operation if tracking fails
    }

    return NextResponse.json({
      success: true,
      chunksCreated: result.chunksCreated,
      fileName: file.name,
      projectId,
      type,
      message: `Successfully indexed ${result.chunksCreated} chunks using Ollama (nomic-embed-text) → Qdrant`,
    });

  } catch (error) {
    console.error('Document indexing error:', error);
    
    // Record failed indexing attempt
    try {
      if (formData) {
        const file = formData.get('file') as File | null;
        const projectId = formData.get('projectId') as string;
        const type = formData.get('type') as string;
        const userId = formData.get('userId') as string | null;
        
        if (file && projectId) {
          const { recordFailedIndexing } = await import('@/modules/rag/infrastructure/document-tracking-service');
          await recordFailedIndexing({
            projectId: projectId.trim(),
            userId: userId ? userId.trim() : undefined,
            sourceFile: file.name,
            fileSize: file.size,
            type: type || 'context',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (trackingError) {
      console.error('Failed to record error in tracking database:', trackingError);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to index document',
      },
      { status: 500 }
    );
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

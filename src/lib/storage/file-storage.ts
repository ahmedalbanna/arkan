
import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Initialize uploads directory if it doesn't exist
 */
async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Generate a unique filename
 */
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const randomName = randomBytes(16).toString('hex');
  return `${randomName}.${ext}`;
}

/**
 * Save a file to local storage
 * @param file The file to save
 * @param subdirectory Subdirectory within uploads (e.g., 'profile-pictures')
 * @returns The relative URL path to the saved file
 */
export async function saveFile(file: File, subdirectory: string): Promise<string> {
  try {
    await ensureUploadsDir();

    // Validate file
    if (!file || file.size === 0) {
      throw new Error('File is empty');
    }

    // Generate safe filename
    const fileName = generateFileName(file.name);
    const subDir = join(UPLOADS_DIR, subdirectory);
    
    // Create subdirectory if it doesn't exist
    if (!existsSync(subDir)) {
      await mkdir(subDir, { recursive: true });
    }

    // Save file
    const filePath = join(subDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return relative URL path
    return `/uploads/${subdirectory}/${fileName}`;
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from local storage
 * @param relativePath The relative path returned from saveFile
 */
export async function deleteFile(relativePath: string): Promise<void> {
  try {
    // Security: Only allow deletion from uploads directory
    if (!relativePath.startsWith('/uploads/')) {
      throw new Error('Invalid file path');
    }

    const filePath = join(process.cwd(), 'public', relativePath);
    
    // Additional security check: ensure file is within uploads directory
    if (!filePath.startsWith(UPLOADS_DIR)) {
      throw new Error('File path is outside uploads directory');
    }

    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = 5
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get allowed MIME types for images
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Get allowed MIME types for documents
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

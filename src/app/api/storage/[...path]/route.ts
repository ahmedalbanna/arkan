import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const filePathArray = (await params).path;
    const relativePath = filePathArray.join('/');
    
    // Security Check: Prevent path traversal
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
        return new NextResponse('Invalid path', { status: 400 });
    }

    const baseDir = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage');
    const fullPath = path.join(baseDir, relativePath);

    if (!fs.existsSync(fullPath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = await fs.promises.readFile(fullPath);
        const contentType = mime.lookup(fullPath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('[API_STORAGE] Error reading file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

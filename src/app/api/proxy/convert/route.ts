import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const imageUrl = request.nextUrl.searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Validate the URL to prevent potential security issues like SSRF.
        const url = new URL(imageUrl);

        // --- SECURITY-CRITICAL ---
        // Restrict fetching to only allowed domains to prevent abuse.
        const allowedDomains = ['www.plantuml.com'];
        if (!allowedDomains.includes(url.hostname)) {
            return new NextResponse(`Forbidden domain: ${url.hostname}`, { status: 403 });
        }

        const imageResponse = await fetch(url.toString(), {
            headers: {
                // Forward a user-agent to avoid being blocked by some services.
                'User-Agent': request.headers.get('User-Agent') || 'Arkan-Image-Proxy/1.0',
            },
        });

        if (!imageResponse.ok) {
            return new NextResponse(imageResponse.statusText, {
                status: imageResponse.status,
            });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';

        // Create a new response with the image data and correct headers.
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache aggressively
            },
        });
    } catch (error) {
        console.error('[API_PROXY] Error fetching image:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}

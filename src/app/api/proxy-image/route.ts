
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const validation = schema.safeParse({ url: searchParams.get('url') });

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid URL provided.' }, { status: 400 });
  }

  const { url } = validation.data;

  // Basic check to ensure we are only proxying expected domains
  const allowedDomains = ['www.plantuml.com', 'placehold.co'];
  const requestUrl = new URL(url);
  if (!allowedDomains.includes(requestUrl.hostname)) {
    return NextResponse.json({ error: 'Proxying from this domain is not allowed.' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy the requested image.' }, { status: 502 }); // 502 Bad Gateway
  }
}

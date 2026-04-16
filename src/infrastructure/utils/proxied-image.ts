export interface ProxiedImage {
  buffer: ArrayBuffer;
  contentType: string;
}

/**
 * Fetches an image via a server-side fetch or a client-side proxy route to avoid CORS issues.
 */
export async function getProxiedImageBuffer(imageUrl: string): Promise<ProxiedImage | null> {
  try {
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      const contentType = response.headers.get('Content-Type') || 'image/png';
      if (!contentType.startsWith('image/')) return null;
      const buffer = await response.arrayBuffer();
      return { buffer, contentType };
    }

    if (typeof window === 'undefined') {
      if (!imageUrl.startsWith('http')) return null;
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      const contentType = response.headers.get('Content-Type') || 'image/png';
      if (!contentType.startsWith('image/')) return null;
      const buffer = await response.arrayBuffer();
      return { buffer, contentType };
    }

    const proxiedUrl = `/api/proxy/convert?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) return null;
    const contentType = response.headers.get('Content-Type') || 'image/png';
    if (!contentType.startsWith('image/')) return null;
    const buffer = await response.arrayBuffer();
    return { buffer, contentType };
  } catch {
    return null;
  }
}


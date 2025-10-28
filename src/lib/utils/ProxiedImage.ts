export interface ProxiedImage {
    buffer: ArrayBuffer;
    contentType: string;
  }
  
  /**
   * Fetches an image via a server-side proxy or handles data URLs to avoid CORS issues.
   * @param imageUrl The original URL of the image to fetch.
   * @returns A promise that resolves to an object containing the image buffer and content type, or null on failure.
   */
  export async function getProxiedImageBuffer(imageUrl: string): Promise<ProxiedImage | null> {
    try {
      // Handle base64 data URLs directly
      if (imageUrl.startsWith('data:')) {
          const response = await fetch(imageUrl);
          if (!response.ok) {
              console.warn(`Failed to fetch data URL. Status: ${response.statusText}`);
              return null;
          }
          const contentType = response.headers.get('Content-Type') || 'image/png';
          const buffer = await response.arrayBuffer();
          return { buffer, contentType };
      }
        
      // Handle remote URLs via proxy
      const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch proxied image from ${imageUrl}. Status: ${response.statusText}`);
        return null;
      }
      const contentType = response.headers.get('Content-Type') || 'image/png'; // Default to png
      const buffer = await response.arrayBuffer();
      return { buffer, contentType };
    } catch (error) {
      console.error(`Error fetching or processing image from ${imageUrl}:`, error);
      return null;
    }
  }
  
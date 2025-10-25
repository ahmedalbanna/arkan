import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import pako from 'pako';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// generate random password
export function generateRandomPassword(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

/**
 * Converts an ArrayBuffer to a base64 string.
 * @param buffer The ArrayBuffer to convert.
 * @returns The base64 encoded string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
/**
 * Encodes a byte array into a PlantUML-specific base64-like format.
 * @param data The byte array to encode.
 * @returns The encoded string.
 */
function encode64(data: Uint8Array): string {
  const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data[i];
    const b2 = i + 1 < data.length ? data[i + 1] : 0;
    const b3 = i + 2 < data.length ? data[i + 2] : 0;

    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 15) << 2) | (b3 >> 6);
    const c4 = b3 & 63;

    r += B64_MAP.charAt(c1);
    r += B64_MAP.charAt(c2);
    if (i + 1 < data.length) {
      r += B64_MAP.charAt(c3);
    }
    if (i + 2 < data.length) {
      r += B64_MAP.charAt(c4);
    }
  }
  return r;
}

export function processPlantUml(markdown: string): string {
  if (typeof markdown !== 'string') {
    return markdown;
  }
  return markdown.replace(/```plantuml([\s\S]*?)```/g, (match, plantUmlCode) => {
    if (plantUmlCode.trim().startsWith('@startuml') && plantUmlCode.trim().endsWith('@enduml')) {
      const utf8Encoder = new TextEncoder();
      const compressed = pako.deflate(utf8Encoder.encode(plantUmlCode));
      const encoded = encode64(compressed);
      const imageUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;
      return `![Diagram](${imageUrl})`;
    }
    return match; // Return the original block if it's not a valid PlantUML
  });
}
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

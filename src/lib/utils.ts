import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { deflateSync } from 'zlib';

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

function encode64(data: Buffer): string {
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

function getPlantUmlImageUrl(plantUmlCode: string): string {
  const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
  const encoded = encode64(compressed);
  const plantUmlUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;
  // We don't proxy this on the client side, as it's just for display within markdown.
  // The official proxy is used when generating DOCX files.
  return plantUmlUrl;
}

export function processPlantUml(markdown: string): string {
  if (typeof markdown !== 'string') {
    return markdown;
  }
  return markdown.replace(/```plantuml([\s\S]*?)```/g, (match, plantUmlCode) => {
    if (plantUmlCode.trim().startsWith('@startuml') && plantUmlCode.trim().endsWith('@enduml')) {
      const imageUrl = getPlantUmlImageUrl(plantUmlCode);
      return `![Diagram](${imageUrl})`;
    }
    return match; // Return the original block if it's not a valid PlantUML
  });
}

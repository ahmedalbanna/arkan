import pako from "pako";
import { encode64 } from "@/lib/utils/encode64";
import { getProxiedImageBuffer } from "@/modules/templates/infrastructure/utils/ProxiedImage";

export async function processPlantUml(markdown: string): Promise<string> {
  if (typeof markdown !== 'string') {
    return markdown;
  }

  const plantUmlRegex = /```plantuml([\s\S]*?)```/g;
  const matches = Array.from(markdown.matchAll(plantUmlRegex));
  let processedMarkdown = markdown;

  for (const match of matches) {
    const plantUmlCode = match[1];
    if (plantUmlCode.trim().startsWith('@startuml') && plantUmlCode.trim().endsWith('@enduml')) {
      try {
        const utf8Encoder = new TextEncoder();
        const compressed = pako.deflate(utf8Encoder.encode(plantUmlCode));
        const encoded = encode64(compressed);
        const imageUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;

        // Fetch the image and convert to a data URI
        const proxiedImage = await getProxiedImageBuffer(imageUrl);
        if (proxiedImage) {
          let base64String;
          if (typeof Buffer !== 'undefined') {
            base64String = Buffer.from(proxiedImage.buffer).toString('base64');
          } else {
            let binary = '';
            const bytes = new Uint8Array(proxiedImage.buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            base64String = btoa(binary);
          }
          const dataUri = `data:${proxiedImage.contentType};base64,${base64String}`;
          processedMarkdown = processedMarkdown.replace(match[0], `![Diagram](${dataUri})`);
        } else {
          console.warn(`Failed to fetch and embed PlantUML image for code:\n${plantUmlCode}`);
        }

      } catch (error) {
        console.error("Error processing PlantUML block:", error);
        // Leave the original block in case of an error
      }
    }
  }

  return processedMarkdown;
}

export function editorPlantUml(markdown: string): string {
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
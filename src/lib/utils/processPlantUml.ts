import pako from "pako";
import { encode64 } from "./encode64";
import { getProxiedImageBuffer } from "./ProxiedImage";

export async function processPlantUml(markdown: string): Promise<string> {
  if (typeof markdown !== 'string') {
    return markdown;
  }

  const plantUmlRegex = /```plantuml([\s\S]*?)```/g;
  const matches = markdown.matchAll(plantUmlRegex);
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
            let base64String = '';
            const bytes = new Uint8Array(proxiedImage.buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                base64String += String.fromCharCode(bytes[i]);
            }
            const dataUri = `data:${proxiedImage.contentType};base64,${btoa(base64String)}`;
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

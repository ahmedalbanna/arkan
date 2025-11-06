import pako from "pako";
import { encode64 } from "./encode64";

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

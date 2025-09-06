// src/lib/word-converter/inline-converter.ts

import {
  TextRun,
  ImageRun,
  ExternalHyperlink,
  FootnoteReferenceRun,
  IRunOptions,
  ShadingType,
} from 'docx';
import { PhrasingContent } from 'mdast';
import { getProxiedImageBuffer } from '@/lib/utils';
import { FontOptions } from './types';

// Helper to convert markdown AST nodes to docx TextRun arrays
export async function transformInlines(
  nodes: PhrasingContent[],
  footnoteIdMap: Map<string, number>,
  options: IRunOptions = {},
  fonts: FontOptions = {}
): Promise<(TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[]> {
  const runs: (TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'strong':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, bold: true }, fonts)));
        break;
      case 'emphasis':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, italics: true }, fonts)));
        break;
      case 'delete':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, strike: true }, fonts)));
        break;
      case 'text':
        runs.push(new TextRun({ ...options, text: node.value }));
        break;
      case 'image':
        try {
          const proxiedImage = await getProxiedImageBuffer(node.url);
          if (proxiedImage) {
            // Default size for inline images
            runs.push(new ImageRun({
              data: proxiedImage.buffer,
              transformation: { width: 200, height: 150 }
            }));
          }
        } catch (e) { console.error("Failed to process inline image", e); }
        break;
      case 'link': {
        // Recursively process the link's text content (which can include bold, italics, etc.)
        const linkChildren = await transformInlines(node.children, footnoteIdMap, { ...options, style: 'Hyperlink' }, fonts);
        // The docx ExternalHyperlink can only contain TextRuns. We filter to ensure type safety.
        const textRuns = linkChildren.filter((child): child is TextRun => child instanceof TextRun);
        runs.push(new ExternalHyperlink({
          children: textRuns,
          link: node.url,
        }));
        break;
      }
      case 'inlineCode': {
        const codeFont = fonts.code || 'Courier New';
        runs.push(new TextRun({
          ...options,
          text: node.value,
          font: { ...options.font, name: codeFont },
          shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
        }));
        break;
      }
      case 'footnoteReference': {
        const id = footnoteIdMap.get(node.identifier);
        if (id !== undefined) {
          runs.push(new FootnoteReferenceRun(id));
        }
        break;
      }
    }
  }
  return runs;
}

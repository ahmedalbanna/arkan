// src/lib/word-converter/inline-converter.ts

import {
  TextRun,
  ImageRun,
  ExternalHyperlink,
  FootnoteReferenceRun,
  IRunOptions,
} from 'docx';
import { PhrasingContent } from 'mdast';
import { getProxiedImageBuffer } from '@/lib/utils';
import { ConversionOptions } from './types';

export async function transformInlines(
  nodes: PhrasingContent[],
  footnoteIdMap: Map<string, number>,
  baseOptions: IRunOptions = {},
  options: ConversionOptions
): Promise<(TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[]> {
  const runs: (TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'strong':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...baseOptions, bold: true }, options)));
        break;
      case 'emphasis':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...baseOptions, italics: true }, options)));
        break;
      case 'delete':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...baseOptions, strike: true }, options)));
        break;
      case 'text':
        runs.push(new TextRun({ ...baseOptions, text: node.value }));
        break;
      case 'image':
        try {
          const proxiedImage = await getProxiedImageBuffer(node.url);
          if (proxiedImage) {
            // Removed hardcoded size for inline images
            runs.push(new ImageRun({
              data: proxiedImage.buffer,
              transformation: { width: 150, height: 100 } // A smaller default
            }));
          }
        } catch (e) { console.error("Failed to process inline image", e); }
        break;
      case 'link': {
        const linkChildren = await transformInlines(node.children, footnoteIdMap, { ...baseOptions, style: 'Hyperlink' }, options);
        const textRuns = linkChildren.filter((child): child is TextRun => child instanceof TextRun);
        runs.push(new ExternalHyperlink({
          children: textRuns,
          link: node.url,
        }));
        break;
      }
      case 'inlineCode': {
        // Apply the 'InlineCode' character style defined in the template
        runs.push(new TextRun({
          ...baseOptions,
          text: node.value,
          style: 'InlineCode',
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

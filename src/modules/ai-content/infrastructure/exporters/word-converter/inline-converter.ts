// src/lib/word-converter/inline-converter.ts

import { getProxiedImageBuffer } from '@/modules/templates/infrastructure/utils/ProxiedImage';
import {
  ExternalHyperlink,
  FootnoteReferenceRun,
  ImageRun,
  IRunOptions,
  TextRun,
} from 'docx';
import { PhrasingContent } from 'mdast';
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
          if (!node.url || node.url.trim() === '') {
            console.warn('Empty or invalid inline image URL detected, skipping...');
            runs.push(new TextRun({ text: `[Invalid image]` }));
            break;
          }

          const proxiedImage = await getProxiedImageBuffer(node.url);
          if (proxiedImage && proxiedImage.buffer && proxiedImage.buffer.byteLength > 0) {
            runs.push(new ImageRun({
              data: proxiedImage.buffer,
              transformation: { width: 150, height: 100 },
            }));
            console.log(`Successfully processed inline image: ${node.url}`);
          } else {
            const fallbackText = node.alt || '[Image]';
            runs.push(new TextRun({ text: fallbackText }));
          }
        } catch (e) { 
          console.error("Failed to process inline image", e); 
          const fallbackText = node.alt || '[Image error]';
          runs.push(new TextRun({ text: fallbackText }));
        }
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
      case 'break': {
        runs.push(new TextRun({ ...baseOptions, break: 1 }));
        break;
      }
      case 'html': {
        const textContent = node.value
          .replace(/<[^>]*>/g, '') 
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        if (textContent.trim()) {
          runs.push(new TextRun({ ...baseOptions, text: textContent }));
        }
        break;
      }
    }
  }
  return runs;
}

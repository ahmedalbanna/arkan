// src/lib/word-converter/node-handlers.ts

import {
  AlignmentType,
  IRunOptions,
  Paragraph,
} from 'docx';
import { FootnoteDefinition, Root } from 'mdast';
import { transformInlines } from './inline-converter';
import { ConversionOptions } from './types';

// Define footnote type locally
interface DocxFootnote {
  id: number;
  children: any[];
}

export async function processFootnotes(
  ast: Root,
  options: ConversionOptions
): Promise<{ footnoteIdMap: Map<string, number>; docxFootnotes: Record<number, DocxFootnote> }> {
  const footnoteIdMap = new Map<string, number>();
  const docxFootnotes: Record<number, DocxFootnote> = {};
  let footnoteCounter = 1;

  const { isRtl = false, fonts = {} } = options;

  const footnoteDefs = ast.children.filter(
    (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
  );

  for (const node of footnoteDefs) {
    const id = footnoteCounter++;
    footnoteIdMap.set(node.identifier, id);

    const defaultFontName = isRtl ? fonts.rtl : fonts.default;
    const runOptions: IRunOptions = {
      font: defaultFontName ? { name: defaultFontName } : undefined,
    };
    if (isRtl) {
      (runOptions as any).rightToLeft = true;
    }


    const footnoteParagraphs: Paragraph[] = [];
    for (const contentNode of node.children) {
      if (contentNode.type === 'paragraph') {
        footnoteParagraphs.push(
          new Paragraph({
            children: await transformInlines(contentNode.children, footnoteIdMap, runOptions, options),
            bidirectional: isRtl,
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          }),
        );
      }
    }
    docxFootnotes[id] = { id, children: footnoteParagraphs };
  }

  return { footnoteIdMap, docxFootnotes };
}

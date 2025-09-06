// src/lib/word-converter/node-handlers.ts

import {
  Paragraph,
  AlignmentType,
  IFootnotesOptions,
  IRunOptions,
  TextRun,
  ImageRun,
  ExternalHyperlink,
  FootnoteReferenceRun,
  Table,
  TableRow,
  TableCell,
  SimpleField,
  HeadingLevel,
  WidthType,
  ShadingType,
} from 'docx';
import { Root, List, FootnoteDefinition, RootContent } from 'mdast';
import { getProxiedImageBuffer } from '@/lib/utils';
import { FontOptions } from './types';
import { transformInlines } from './inline-converter';

/**
 * Processes footnote definitions from the AST.
 * @param ast The root of the markdown AST.
 * @returns An object containing the footnote ID map and the docx footnotes configuration.
 */
export async function processFootnotes(
  ast: Root,
  isRtl = false,
  fonts: FontOptions = {}
): Promise<{ footnoteIdMap: Map<string, number>; docxFootnotes: IFootnotesOptions }> {
  const footnoteIdMap = new Map<string, number>();
  const docxFootnotes: IFootnotesOptions = {};
  let footnoteCounter = 1;

  const footnoteDefs = ast.children.filter(
    (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
  );

  for (const node of footnoteDefs) {
    const id = footnoteCounter++;
    footnoteIdMap.set(node.identifier, id);

    const defaultFontName = isRtl ? fonts.rtl : fonts.default;
    const runOptions: IRunOptions = {};
    if (isRtl) runOptions.rightToLeft = true;
    if (defaultFontName) runOptions.font = { name: defaultFontName };

    const footnoteParagraphs: Paragraph[] = [];
    for (const contentNode of node.children) {
      if (contentNode.type === 'paragraph') {
        footnoteParagraphs.push(
          new Paragraph({
            children: await transformInlines(contentNode.children, footnoteIdMap, runOptions, fonts),
            bidirectional: isRtl,
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          }),
        );
      }
    }
    docxFootnotes[id] = { children: footnoteParagraphs };
  }

  return { footnoteIdMap, docxFootnotes };
}



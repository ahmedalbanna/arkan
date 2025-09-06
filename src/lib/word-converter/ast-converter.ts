// src/lib/word-converter/ast-converter.ts

import {
  Paragraph,
  AlignmentType,
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
import { Root, List, RootContent } from 'mdast';
import { getProxiedImageBuffer } from '@/lib/utils';
import { FontOptions, DocxObject } from './types';
import { transformInlines } from './inline-converter';

/**
 * Converts the main markdown AST nodes into an array of docx objects.
 * @param ast The root of the markdown AST.
 * @param footnoteIdMap A map of footnote identifiers to their generated IDs.
 * @returns A promise that resolves to an array of docx objects.
 */
export async function convertAstToDocxObjects(ast: Root, footnoteIdMap: Map<string, number>, isRtl = false, fonts: FontOptions = {}): Promise<DocxObject[]> {
  const docxObjects: DocxObject[] = [];

  const defaultFontName = isRtl ? fonts.rtl : fonts.default;
  const baseRunOptions: IRunOptions = {};
  if (isRtl) baseRunOptions.rightToLeft = true;
  if (defaultFontName) baseRunOptions.font = { name: defaultFontName };

  const baseParagraphOptions = {
    bidirectional: isRtl,
    alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
  };

  const processListItems = async (listNode: List, level: number): Promise<Paragraph[]> => {
    const paragraphs: Paragraph[] = [];
    for (const listItem of listNode.children) {
      for (const itemContent of listItem.children) {
        if (itemContent.type === 'paragraph') {
          const children = await transformInlines(itemContent.children, footnoteIdMap, baseRunOptions, fonts);
          paragraphs.push(new Paragraph({
            ...baseParagraphOptions,
            children, style: 'ListParagraph',
            bullet: listNode.ordered ? undefined : { level },
            numbering: listNode.ordered ? { reference: "default-numbering", level } : undefined
          }));
        } else if (itemContent.type === 'list') {
          paragraphs.push(...await processListItems(itemContent as List, level + 1));
        }
      }
    }
    return paragraphs;
  };

  for (let i = 0; i < ast.children.length; i++) {
    const node = ast.children[i];
    const nextNode = ast.children[i + 1];

    const getCaption = (node: RootContent | undefined): string | null => {
      if (node && node.type === 'html') {
        const match = node.value.match(/<!--\s*caption:\s*(.*?)\s*-->/);
        if (match) {
          return match[1].trim();
        }
      }
      return null;
    };

    if (node.type === 'footnoteDefinition') continue;

    switch (node.type) {
      case 'html': {
        const orientationMatch = node.value.match(/<!--\s*orientation:\s*(landscape|portrait)\s*-->/);
        if (orientationMatch) {
          docxObjects.push({
            _type: 'directive',
            name: 'orientation',
            value: orientationMatch[1] as 'landscape' | 'portrait',
          });
        }
        break;
      }
      case 'heading':
        docxObjects.push(
          new Paragraph({
            ...baseParagraphOptions,
            children: await transformInlines(node.children, footnoteIdMap, baseRunOptions, fonts),
            heading: `Heading${node.depth}` as HeadingLevel,
          })
        );
        break;
      case 'paragraph': {
        const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
        const captionText = getCaption(nextNode);

        if (imageNode) {
          try {
            const proxiedImage = await getProxiedImageBuffer(imageNode.url);
            if (proxiedImage) {
              docxObjects.push(new Paragraph({
                children: [new ImageRun({ data: proxiedImage.buffer, transformation: { width: 550, height: 400 } })],
                alignment: AlignmentType.CENTER,
              }));
            } else {
              docxObjects.push(new Paragraph({ children: [new TextRun(`[Image failed to load: ${imageNode.alt}]`)] }));
            }

            if (captionText) {
              docxObjects.push(new Paragraph({
                children: [
                  new TextRun({ text: "Figure ", bold: true }),
                  new SimpleField(`SEQ Figure \* ARABIC`),
                  new TextRun({ text: ": ", bold: true, break: 0 }),
                  new TextRun(captionText),
                ],
                style: "Caption",
                alignment: AlignmentType.CENTER,
              }));
              i++; // Increment i to skip the caption comment node
            }
          } catch (e) {
            console.error("Failed to process block image", e);
          }
        } else {
          docxObjects.push(new Paragraph({
            ...baseParagraphOptions,
            children: await transformInlines(node.children, footnoteIdMap, baseRunOptions, fonts),
          }));
        }
        break;
      }
      case 'list':
        docxObjects.push(...await processListItems(node, 0));
        break;
      case 'table': {
        const captionText = getCaption(nextNode);

        if (captionText) {
          docxObjects.push(new Paragraph({
            children: [
              new TextRun({ text: "Table ", bold: true }),
              new SimpleField(`SEQ Table \* ARABIC`, true),
              new TextRun({ text: ": ", bold: true }),
              new TextRun(captionText),
            ],
            style: "Caption",
            alignment: AlignmentType.CENTER,
          }));
          i++; // Increment i to skip the caption comment node
        }
        const tableRows = await Promise.all(node.children.map(async (row, rowIndex) => {
          return new TableRow({
            children: await Promise.all(row.children.map(async cell => new TableCell({
              children: [new Paragraph({ ...baseParagraphOptions, children: await transformInlines(cell.children, footnoteIdMap, baseRunOptions, fonts) })],
            }))),
            tableHeader: rowIndex === 0,
          });
        }));
        docxObjects.push(new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }));
        break;
      }
      case 'blockquote':
        for (const content of node.children) {
          if (content.type === 'paragraph') {
            docxObjects.push(new Paragraph({
              ...baseParagraphOptions,
              children: await transformInlines(content.children, footnoteIdMap, baseRunOptions, fonts),
              style: 'Quote', // Assumes 'Quote' style is defined
            }));
          }
        }
        break;
      case 'thematicBreak':
        docxObjects.push(new Paragraph({ // Treat horizontal rule as a page break
          pageBreakBefore: true,
        }));
        break;
      case 'code': {
        const codeFont = fonts.code || 'Courier New';
        const codeLines = node.value.split('\n');
        const textRuns = codeLines.map((line, index) => {
          const textRun = new TextRun({
            text: line,
            font: { name: codeFont, size: 18 }, // 9pt font for code
          });
          // Add a line break except for the last line
          return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
        }).flat();

        docxObjects.push(new Paragraph({
          children: textRuns,
          shading: {
            type: ShadingType.CLEAR,
            fill: 'F2F2F2', // A light grey background
          },
          spacing: { before: 200, after: 200 },
          indent: { left: 400 },
          bidirectional: false,
          alignment: AlignmentType.LEFT,
        }));
        break;
      }
    }
  }
  return docxObjects;
}

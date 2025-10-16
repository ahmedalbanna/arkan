// src/lib/word-converter/ast-converter.ts

import {
  Paragraph,
  AlignmentType,
  TextRun,
  SimpleField,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  IRunOptions,
} from 'docx';
import { Root, List, RootContent } from 'mdast';
import { getProxiedImageBuffer } from '@/lib/utils';
import { DocxObject, ConversionOptions } from './types';
import { transformInlines } from './inline-converter';

export async function convertAstToDocxObjects(ast: Root, footnoteIdMap: Map<string, number>, options: ConversionOptions): Promise<DocxObject[]> {
  const docxObjects: DocxObject[] = [];
  const { isRtl = false, fonts = {}, customStyles = {} } = options;

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
          const children = await transformInlines(itemContent.children, footnoteIdMap, baseRunOptions, options);
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
        if (match) return match[1].trim();
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
            children: await transformInlines(node.children, footnoteIdMap, baseRunOptions, options),
            heading: `Heading${node.depth}` as any,
          })
        );
        break;
      case 'paragraph': {
        const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
        const captionText = getCaption(nextNode);

        if (imageNode) {
          try {
            const proxiedImage = await getProxiedImageBuffer(imageNode.url);
            const imageParagraph = new Paragraph({
              ...(customStyles.imageParagraph || { alignment: AlignmentType.CENTER }),
              children: proxiedImage
                ? [new ImageRun({ data: proxiedImage.buffer, transformation: { width: 550, height: 400 } })]
                : [new TextRun(`[Image failed to load: ${imageNode.alt}]`)],
            });
            docxObjects.push(imageParagraph);

            if (captionText) {
              docxObjects.push(new Paragraph({
                children: [
                  new TextRun({ text: "Figure ", bold: true }),
                  new SimpleField(`SEQ Figure \\* ARABIC`),
                  new TextRun({ text: ": ", bold: true }),
                  new TextRun(captionText),
                ],
                style: "Caption",
              }));
              i++;
            }
          } catch (e) {
            console.error("Failed to process block image", e);
          }
        } else {
          docxObjects.push(new Paragraph({
            ...baseParagraphOptions,
            children: await transformInlines(node.children, footnoteIdMap, baseRunOptions, options),
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
              new SimpleField(`SEQ Table \\* ARABIC`),
              new TextRun({ text: ": ", bold: true }),
              new TextRun(captionText),
            ],
            style: "Caption",
          }));
          i++;
        }
        const tableRows = await Promise.all(node.children.map(async (row, rowIndex) => {
          return new TableRow({
            children: await Promise.all(row.children.map(async cell => new TableCell({
              children: [new Paragraph({ ...baseParagraphOptions, children: await transformInlines(cell.children, footnoteIdMap, baseRunOptions, options) })],
            }))),
            tableHeader: rowIndex === 0,
          });
        }));
        docxObjects.push(new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          style: "CustomTableStyle",
        }));
        break;
      }
      case 'blockquote':
        for (const content of node.children) {
          if (content.type === 'paragraph') {
            docxObjects.push(new Paragraph({
              ...baseParagraphOptions,
              children: await transformInlines(content.children, footnoteIdMap, baseRunOptions, options),
              style: 'Quote',
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
          return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
        }).flat();

        docxObjects.push(new Paragraph({
          ...customStyles.codeBlock, // Use styles from template
          children: textRuns,
        }));
        break;
      }
    }
  }
  return docxObjects;
}

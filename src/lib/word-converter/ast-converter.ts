// src/lib/word-converter/ast-converter.ts

import { getProxiedImageBuffer } from '@/lib/utils/ProxiedImage';
import {
  AlignmentType,
  ImageRun,
  IRunOptions,
  Paragraph,
  SimpleField,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { List, Root, RootContent } from 'mdast';
import { transformInlines } from './inline-converter';
import { ConversionOptions, DocxObject } from './types';

export async function convertAstToDocxObjects(ast: Root, footnoteIdMap: Map<string, number>, options: ConversionOptions): Promise<DocxObject[]> {
  const docxObjects: DocxObject[] = [];
  const { isRtl = false, fonts = {}, customStyles = {} } = options;

  const defaultFontName = isRtl ? fonts.rtl : fonts.default;
  const baseRunOptions: IRunOptions = {
    ...(isRtl ? { rightToLeft: true } : {}),
    ...(defaultFontName ? { font: { name: defaultFontName } } : {}),
  };

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
            children,
            style: 'ListParagraph',
            bullet: listNode.ordered ? undefined : { level },
            numbering: listNode.ordered ? { reference: "default-numbering", level } : undefined
          }));
        } else if (itemContent.type === 'list') {
          paragraphs.push(...await processListItems(itemContent as List, level + 1));
        } else if (itemContent.type === 'blockquote') {
          for (const blockContent of itemContent.children) {
            if (blockContent.type === 'paragraph') {
              const children = await transformInlines(blockContent.children, footnoteIdMap, baseRunOptions, options);
              paragraphs.push(new Paragraph({
                ...baseParagraphOptions,
                children,
                style: 'Quote',
              }));
            }
          }
        } else if (itemContent.type === 'code') {
          const codeFont = fonts.code || 'Courier New';
          const codeLines = itemContent.value.split('\n');
          const textRuns = codeLines.map((line, index) => {
            const textRun = new TextRun({
              text: line,
              font: { name: codeFont },
              size: 18, 
            });
            return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
          }).flat();
          paragraphs.push(new Paragraph({
            ...customStyles.codeBlock,
            children: textRuns,
          }));
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
          // This is a directive, not content. Push a special object.
          docxObjects.push({
            _type: 'directive',
            name: 'orientation',
            value: orientationMatch[1] as 'landscape' | 'portrait',
          });
          break;
        }

        const pageBreakMatch = node.value.match(/<!--\s*page-break\s*-->/);
        if (pageBreakMatch) {
          docxObjects.push(new Paragraph({
            pageBreakBefore: true,
          }));
          break;
        }
        
        // Correctly handle section breaks by pushing a directive
        const sectionBreakMatch = node.value.match(/<!--\s*section-break\s*-->/);
        if (sectionBreakMatch) {
          docxObjects.push({
            _type: 'directive',
            name: 'orientation',
            value: 'portrait', // Default to portrait for the new section
          });
          break;
        }

        const textContent = node.value
          .replace(/<!--[\s\S]*?-->/g, '') 
          .replace(/<[^>]*>/g, '') 
          .trim();

        if (textContent) {
          docxObjects.push(new Paragraph({
            ...baseParagraphOptions,
            children: [new TextRun(textContent)],
          }));
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
            if (!imageNode.url || imageNode.url.trim() === '') {
              console.warn('Empty or invalid image URL detected, skipping...');
              docxObjects.push(new Paragraph({
                children: [new TextRun(`[Invalid image URL]`)],
                alignment: AlignmentType.CENTER,
              }));
              break;
            }

            const proxiedImage = await getProxiedImageBuffer(imageNode.url);
            let imageChildren;
            
            if (proxiedImage && proxiedImage.buffer && proxiedImage.buffer.byteLength > 0) {
              const maxWidth = 550;
              const defaultHeight = 400; 
              
              imageChildren = [new ImageRun({
                data: proxiedImage.buffer,
                transformation: {
                  width: maxWidth,
                  height: defaultHeight,
                },
              })];
              
              console.log(`Successfully processed image: ${imageNode.url}`);
            } else {
              console.warn(`Could not create valid image buffer for URL: ${imageNode.url}`);
              const fallbackText = imageNode.alt || imageNode.url || '[Image not available]';
              imageChildren = [new TextRun(`[Image failed to load: ${fallbackText}]`)];
            }

            const imageParagraph = new Paragraph({
              ...(customStyles?.imageParagraph || { alignment: AlignmentType.CENTER }),
              children: imageChildren,
            });
            docxObjects.push(imageParagraph);

            if (captionText && captionText.trim()) {
              docxObjects.push(new Paragraph({
                children: [
                  new TextRun({ text: "Figure ", bold: true }),
                  new SimpleField(`SEQ Figure \\* ARABIC`),
                  new TextRun({ text: ": ", bold: true }),
                  new TextRun(captionText),
                ],
                style: "Caption",
                alignment: AlignmentType.CENTER,
              }));
              i++;
            }
          } catch (e) {
            console.error("Failed to process block image", e);
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            docxObjects.push(new Paragraph({
              children: [new TextRun(`[Error processing image: ${imageNode.url} - ${errorMessage}]`)],
              alignment: AlignmentType.CENTER,
            }));
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
        try {
          const listItems = await processListItems(node, 0);
          if (listItems.length > 0) {
            docxObjects.push(...listItems);
          } else {
            console.warn('Empty list detected, adding placeholder...');
            docxObjects.push(new Paragraph({
              children: [new TextRun('[Empty list]')],
            }));
          }
        } catch (listError) {
          console.error('Error processing list:', listError);
          docxObjects.push(new Paragraph({
            children: [new TextRun('[List processing error]')],
          }));
        }
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
        try {
          if (!node.children || node.children.length === 0) {
            console.warn('Empty table detected, skipping...');
            docxObjects.push(new Paragraph({
              children: [new TextRun('[Empty table]')],
            }));
            break;
          }

          const tableRows = await Promise.all(node.children.map(async (row, rowIndex) => {
            try {
              return new TableRow({
                children: await Promise.all(row.children.map(async cell => {
                  try {
                    const children = await transformInlines(cell.children, footnoteIdMap, baseRunOptions, options);
                    const cellParagraph = new Paragraph({
                      ...baseParagraphOptions,
                      children: children.length > 0 ? children : [new TextRun('')],
                    });
                    return new TableCell({
                      children: [cellParagraph],
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    });
                  } catch (cellError) {
                    console.error('Error processing table cell:', cellError);
                    return new TableCell({
                      children: [new Paragraph({ children: [new TextRun('[Cell error]')] })],
                    });
                  }
                })),
                tableHeader: rowIndex === 0,
              });
            } catch (rowError) {
              console.error('Error processing table row:', rowError);
              return new TableRow({
                children: [new TableCell({ children: [new Paragraph({ children: [new TextRun('[Row error]')] })] })],
              });
            }
          }));

          docxObjects.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            style: "CustomTableStyle",
            borders: {
              top: { style: 'single', size: 1 }, bottom: { style: 'single', size: 1 },
              left: { style: 'single', size: 1 }, right: { style: 'single', size: 1 },
              insideHorizontal: { style: 'single', size: 1 }, insideVertical: { style: 'single', size: 1 },
            },
          }));
        } catch (tableError) {
          console.error('Error processing table:', tableError);
          docxObjects.push(new Paragraph({
            children: [new TextRun('[Table processing error]')],
          }));
        }
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
          } else if (content.type === 'heading') {
            docxObjects.push(new Paragraph({
              ...baseParagraphOptions,
              children: await transformInlines(content.children, footnoteIdMap, baseRunOptions, options),
              heading: `Heading${content.depth}` as any,
              style: 'Quote',
            }));
          } else if (content.type === 'list') {
            const listParagraphs = await processListItems(content, 0);
            docxObjects.push(...listParagraphs);
          } else if (content.type === 'code') {
            const codeFont = fonts.code || 'Courier New';
            const codeLines = content.value.split('\n');
            const textRuns = codeLines.map((line, index) => {
              const textRun = new TextRun({ text: line, font: { name: codeFont }, size: 18 });
              return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
            }).flat();
            docxObjects.push(new Paragraph({
              ...customStyles.codeBlock,
              style: 'Quote',
              children: textRuns,
            }));
          }
        }
        break;
      case 'thematicBreak':
        docxObjects.push(new Paragraph({ pageBreakBefore: true }));
        break;
      case 'code': {
        const codeFont = fonts.code || 'Courier New';
        const codeLines = node.value.split('\n');
        const textRuns = codeLines.map((line, index) => {
          const textRun = new TextRun({ text: line, font: { name: codeFont }, size: 18 });
          return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
        }).flat();

        docxObjects.push(new Paragraph({
          ...customStyles.codeBlock,
          children: textRuns,
        }));
        break;
      }
      default: {
        console.warn(`Unhandled node type: ${(node as any).type}`);
        break;
      }
    }
  }
  return docxObjects;
}

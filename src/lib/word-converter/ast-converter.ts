
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
      // Check if this is a task list item (GFM extension)
      // Task lists have a 'checked' property on list items
      const hasCheckedProperty = 'checked' in listItem;
      const isChecked = hasCheckedProperty && (listItem as any).checked === true;

      for (const itemContent of listItem.children) {
        if (itemContent.type === 'paragraph') {
          const children = await transformInlines(itemContent.children, footnoteIdMap, baseRunOptions, options);

          // For task lists, prepend checkbox symbol
          if (hasCheckedProperty) {
            const checkboxSymbol = isChecked ? '☑' : '☐';
            children.unshift(new TextRun({ text: `${checkboxSymbol} `, ...baseRunOptions }));
          }

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
          // Handle blockquotes within list items
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
          // Handle code blocks within list items
          const codeFont = fonts.code || 'Courier New';
          const codeLines = itemContent.value.split('\n');
          const textRuns = codeLines.map((line, index) => {
            const textRun = new TextRun({
              text: line,
              font: { name: codeFont },
              size: 18, // 9pt font for code (size is in half-points)
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
        // Handle orientation directive
        const orientationMatch = node.value.match(/<!--\s*orientation:\s*(landscape|portrait)\s*-->/);
        if (orientationMatch) {
          docxObjects.push({
            _type: 'directive',
            name: 'orientation',
            value: orientationMatch[1] as 'landscape' | 'portrait',
          });
          break;
        }

        // Handle page break directive
        const pageBreakMatch = node.value.match(/<!--\s*page-break\s*-->/);
        if (pageBreakMatch) {
          docxObjects.push(new Paragraph({
            pageBreakBefore: true,
          }));
          break;
        }

        // Handle section break directive
        const sectionBreakMatch = node.value.match(/<!--\s*section-break\s*-->/);
        if (sectionBreakMatch) {
          docxObjects.push(new Paragraph({
            pageBreakBefore: true,
          }));
          break;
        }

        // For other HTML, try to extract meaningful content or skip
        // Block-level HTML that's not a directive is typically ignored
        // or could be rendered as plain text if needed
        const textContent = node.value
          .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .trim();

        if (textContent) {
          // If there's extractable text, render it as a paragraph
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
            const proxiedImage = await getProxiedImageBuffer(imageNode.url);
            let imageChildren;
            if (proxiedImage) {
              // The DOCX library can determine dimensions from the buffer directly.
              // No need for client-side Image objects. Max width is controlled via options.
              const docxWidth = 550;
              imageChildren = [new ImageRun({
                data: proxiedImage.buffer,
                transformation: {
                  width: docxWidth,
                  height: docxWidth, // Height will be adjusted based on aspect ratio automatically by the library
                }
              })];
            } else {
              console.warn(`Could not create image buffer for URL: ${imageNode.url}`);
              imageChildren = [new TextRun(`[Image failed to load: ${imageNode.alt || imageNode.url}]`)];
            }

            const imageParagraph = new Paragraph({
              ...(customStyles.imageParagraph || { alignment: AlignmentType.CENTER }),
              children: imageChildren,
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
            docxObjects.push(new Paragraph({
              children: [new TextRun(`[Error processing image: ${imageNode.url}]`)]
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
            children: await Promise.all(row.children.map(async cell => {
              // Table cells contain phrasing content (inline content)
              // Process all inline content in the cell
              const children = await transformInlines(cell.children, footnoteIdMap, baseRunOptions, options);

              // Ensure at least one paragraph in the cell (even if empty)
              const cellParagraph = new Paragraph({
                ...baseParagraphOptions,
                children: children.length > 0 ? children : [new TextRun('')],
              });

              return new TableCell({
                children: [cellParagraph],
              });
            })),
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
          } else if (content.type === 'heading') {
            // Headings within blockquotes
            docxObjects.push(new Paragraph({
              ...baseParagraphOptions,
              children: await transformInlines(content.children, footnoteIdMap, baseRunOptions, options),
              heading: `Heading${content.depth}` as any,
              style: 'Quote',
            }));
          } else if (content.type === 'list') {
            // Lists within blockquotes - create new paragraphs with Quote style
            const listParagraphs = await processListItems(content, 0);
            // Note: We can't modify the style property after creation, so we need to recreate
            // For now, the list will use its default style within the blockquote context
            docxObjects.push(...listParagraphs);
          } else if (content.type === 'code') {
            // Code blocks within blockquotes
            const codeFont = fonts.code || 'Courier New';
            const codeLines = content.value.split('\n');
            const textRuns = codeLines.map((line, index) => {
              const textRun = new TextRun({
                text: line,
                font: { name: codeFont },
                size: 18,
              });
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
            font: { name: codeFont },
            size: 18, // 9pt font for code (size is in half-points)
          });
          return index < codeLines.length - 1 ? [textRun, new TextRun({ break: 1 })] : [textRun];
        }).flat();

        docxObjects.push(new Paragraph({
          ...customStyles.codeBlock, // Use styles from template
          children: textRuns,
        }));
        break;
      }
      case 'definition': {
        // Definition lists - render as structured paragraphs
        // Definition node contains definition nodes, each with identifier and children
        // Definition nodes are typically used for link/image definitions
        // For now, we'll skip rendering them as they're usually reference definitions
        // If you need to render definition lists, you'd need a different AST structure
        break;
      }
      case 'yaml': {
        // YAML frontmatter - typically skipped in document rendering
        // but could be used for metadata if needed
        // For now, we'll skip it as it's usually metadata
        break;
      }
      default: {
        // Handle any unhandled node types gracefully
        console.warn(`Unhandled node type: ${(node as any).type}`);
        // Try to extract text content if possible
        if ('children' in node && Array.isArray((node as any).children)) {
          try {
            const textContent = extractTextFromNode(node as any);
            if (textContent.trim()) {
              docxObjects.push(new Paragraph({
                ...baseParagraphOptions,
                children: [new TextRun(textContent)],
              }));
            }
          } catch (e) {
            // Silently skip if we can't extract content
          }
        }
        break;
      }
    }
  }
  return docxObjects;
}

/**
 * Helper function to extract text content from an unknown node type
 */
function extractTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value || '';
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((child: any) => extractTextFromNode(child)).join('');
  }
  return '';
}

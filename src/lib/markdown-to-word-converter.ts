// src/lib/markdown-to-word-converter.ts

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  IStylesOptions,
  SectionType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  FootnoteReferenceRun,
  IFootnotesOptions,
  ImageRun,
  ExternalHyperlink,
  ShadingType,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  IHeaderOptions,
  ISectionOptions,
  INumberingOptions,
  TableOfContents,
  FootNotes,
  EmphasisMarkType,
  FootNoteReferenceRunAttributes,
  FootnoteReference,
  FootnoteReferenceElement,
  SimpleField
} from 'docx';
import { saveAs } from 'file-saver';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root, List } from 'mdast';

// Helper to convert markdown AST nodes to docx TextRun arrays
async function transformInlines(
  nodes: any[],
  footnoteIdMap: Map<string, number>,
  options: any = {}
): Promise<(TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[]> {
  const runs: (TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'strong':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, bold: true })));
        break;
      case 'emphasis':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, italics: true })));
        break;
      case 'text':
        runs.push(new TextRun({ ...options, text: node.value }));
        break;
      case 'image':
        try {
            const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(node.url)}`;
            const imageBuffer = await getProxiedImageBuffer(proxiedUrl);
            if (imageBuffer) {
                // Default size for inline images
                runs.push(new ImageRun({
                    data: imageBuffer,
                    transformation: { width: 200, height: 150 }
                }));
            }
        } catch (e) { console.error("Failed to process inline image", e); }
        break;
      case 'link': {
        // Recursively process the link's text content (which can include bold, italics, etc.)
        const linkChildren = await transformInlines(node.children, footnoteIdMap, { style: 'Hyperlink' });
        // The docx ExternalHyperlink can only contain TextRuns. We filter to ensure type safety.
        const textRuns = linkChildren.filter((child): child is TextRun => child instanceof TextRun);
        runs.push(new ExternalHyperlink({
            children: textRuns,
            link: node.url,
        }));
        break;
      }
      case 'inlineCode': {
        runs.push(new TextRun({
            ...options,
            text: node.value,
            font: { name: 'Courier New' },
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

// Main function to parse markdown and create an array of docx objects
async function createDocxContent(markdown: string) {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const docxObjects: (Paragraph | Table)[] = [];

  // 1. Pre-pass to collect and map footnotes
  let tableCounter = 0;
  let figureCounter = 0;

  const footnoteIdMap = new Map<string, number>();
  const docxFootnotes: IFootnotesOptions = {};
  let footnoteCounter = 1;

  const footnoteDefs = ast.children.filter(node => node.type === 'footnoteDefinition');

  for (const node of footnoteDefs) {
      if (node.type === 'footnoteDefinition') {
          const id = footnoteCounter++;
          footnoteIdMap.set(node.identifier, id);

          const footnoteParagraphs: Paragraph[] = [];
          for (const contentNode of node.children) {
              if (contentNode.type === 'paragraph') {
                  footnoteParagraphs.push(new Paragraph({
                      children: await transformInlines(contentNode.children, footnoteIdMap, {}),
                  }));
              }
          }
          docxFootnotes[id] = { children: footnoteParagraphs };
      }
  }

  const processListItems = async (listNode: List, level: number): Promise<Paragraph[]> => {
    const paragraphs: Paragraph[] = [];
    for (const listItem of listNode.children) {
      for (const itemContent of listItem.children) {
        if (itemContent.type === 'paragraph') {
          const children = await transformInlines(itemContent.children, footnoteIdMap);
          paragraphs.push(new Paragraph({ children, style: 'ListParagraph', bullet: listNode.ordered ? undefined : { level }, numbering: listNode.ordered ? { reference: "default-numbering", level } : undefined }));
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

    const getCaption = (node: any): string | null => {
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
        const landscapeMatch = node.value.match(/<!--\s*orientation:\s*landscape\s*-->/);
        if (landscapeMatch) {
            docxObjects.push({ _type: 'directive', name: 'orientation', value: 'landscape' } as any);
            break;
        }
        const portraitMatch = node.value.match(/<!--\s*orientation:\s*portrait\s*-->/);
        if (portraitMatch) {
            docxObjects.push({ _type: 'directive', name: 'orientation', value: 'portrait' } as any);
            break;
        }
        // Caption comments are handled by their preceding element, so we ignore them here.
        break;
      }
      case 'heading':
        docxObjects.push(
          new Paragraph({
            children: await transformInlines(node.children, footnoteIdMap),
            heading: `Heading${node.depth}` as HeadingLevel,
          }),
        );
        break;
      case 'paragraph': {
        const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
        const captionText = getCaption(nextNode);

        if (imageNode) {
            try {
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageNode.url)}`;
                const imageBuffer = await getProxiedImageBuffer(proxiedUrl);
                if (imageBuffer) {
                    docxObjects.push(new Paragraph({
                        children: [new ImageRun({ data: imageBuffer, transformation: { width: 550, height: 400 } })],
                        alignment: AlignmentType.CENTER,
                    }));
                } else {
                    docxObjects.push(new Paragraph({ children: [new TextRun(`[Image failed to load: ${imageNode.alt}]`)] }));
                }

                if (captionText) {
                    figureCounter++;
                    docxObjects.push(new Paragraph({
                        children: [
                            new TextRun({ text: "Figure ", bold: true }),
                            new SimpleField(`SEQ Figure \\* ARABIC`, true),
                            new TextRun({ text: ": ", bold: true }),
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
                children: await transformInlines(node.children, footnoteIdMap),
            }));
        }
        break;
      }
      case 'list':
        docxObjects.push(...await processListItems(node, 0));
        break;
      case 'table': {
        tableCounter++;
        const captionText = getCaption(nextNode);

        if (captionText) {
            docxObjects.push(new Paragraph({
                children: [
                    new TextRun({ text: "Table ", bold: true }),
                    new SimpleField(`SEQ Table \\* ARABIC`, true),
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
              children: [new Paragraph({ children: await transformInlines(cell.children, footnoteIdMap) })],
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
              children: await transformInlines(content.children, footnoteIdMap),
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
        const codeLines = node.value.split('\n');
        const textRuns = codeLines.map((line, index) => {
            const textRun = new TextRun({
                text: line,
                font: { name: 'Courier New', size: 18 }, // 9pt font for code
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
        }));
        break;
      }
    }
  }
  return { docxObjects, docxFootnotes };
}

async function getProxiedImageBuffer(imageUrl: string): Promise<ArrayBuffer | null> {
    try {
        const response = await fetch(imageUrl);
        if (response.status !== 200) {
            console.warn(`Failed to fetch proxied image from ${imageUrl}. Status: ${response.status}`);
            return null;
        }
        return response.arrayBuffer();
    } catch (error) {
        console.error(`Error fetching image from ${imageUrl}:`, error);
        return null;
    }
}

interface PaperProperties {
  size?: { width: number; height: number };
  margins?: { top: number; right: number; bottom: number; left: number };
  orientation?: 'portrait' | 'landscape';
}

interface HeaderFooterContent {
  default?: (Paragraph | Table)[];
  first?: (Paragraph | Table)[];
}

interface ConversionOptions {
  styles?: IStylesOptions;
  paper?: PaperProperties;
  header?: HeaderFooterContent;
  footer?: HeaderFooterContent;
  coverPageMarkdown?: string;
  watermark?: string;
  pageNumbers?: boolean;
}

const numbering: INumberingOptions = {
  config: [
    {
      reference: "default-numbering",
      levels: [
        { level: 0, format: "decimal", text: "%1.", alignment: "start" },
        { level: 1, format: "lowerLetter", text: "%2)", alignment: "start" },
        { level: 2, format: "lowerRoman", text: "%3.", alignment: "start" },
        { level: 3, format: "upperLetter", text: "%4)", alignment: "start" },
      ],
    },
  ],
};

/**
 * Converts a markdown string to a styled .docx file and triggers a download.
 * @param markdown The markdown content to convert.
 * @param fileName The name of the file to be saved (without extension).
 * @param options Optional styles and paper properties.
 */
export async function convertMarkdownToWord(
  markdown: string,
  fileName: string,
  options: ConversionOptions = {}
) {
  const { styles, paper, header, footer, coverPageMarkdown, watermark, pageNumbers } = options;
  const finalStyles = { ...styles };
  if (!finalStyles.paragraphStyles) {
    finalStyles.paragraphStyles = [];
  }

  // Ensure Caption style exists for table and figure captions
  const captionStyleExists = finalStyles.paragraphStyles.some(p => p.id === 'Caption');
  if (!captionStyleExists) {
    finalStyles.paragraphStyles.push({
      id: 'Caption',
      name: 'Caption',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { size: 18, italics: true, color: '595959' }, // 9pt, Italic, Grey
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 240 }, // 6pt before, 12pt after
      },
    });
  }

  const { docxObjects, docxFootnotes } = await createDocxContent(markdown);

  const sections: ISectionOptions[] = [];

  // 1. Add Cover Page section if it exists
  if (coverPageMarkdown && coverPageMarkdown.trim().length > 0) {
    const { docxObjects: coverPageChildren } = await createDocxContent(coverPageMarkdown);
    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
      },
      children: coverPageChildren,
    });
  }

  // 2. Prepare header and footer configurations
  const headerConfiguration: { first?: Header; default?: Header } = {};
  if (header?.first) {
      headerConfiguration.first = new Header({ children: header.first });
  }
  if (header?.default || watermark) {
      const defaultHeaderOptions: IHeaderOptions = { children: header?.default || [] };
      if (watermark) {
          defaultHeaderOptions.watermark = {
            type: 'text',
            text: watermark,
            color: "D3D3D3", // Light Grey
            font: "Calibri",
            angle: -45,
          };
      }
      headerConfiguration.default = new Header(defaultHeaderOptions);
  }

  const footerConfiguration: { first?: Footer; default?: Footer } = {};
  if (footer?.first) {
      footerConfiguration.first = new Footer({ children: footer.first });
  }
  if (footer?.default || pageNumbers) {
    const defaultFooterChildren = footer?.default ? [...footer.default] : [];
    if (pageNumbers) {
      const pageNumberParagraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
          }),
        ],
      });
      defaultFooterChildren.push(pageNumberParagraph);
    }
    footerConfiguration.default = new Footer({ children: defaultFooterChildren });
  }

  // 3. Split content into chunks based on orientation directives
  const contentChunks: { children: (Paragraph | Table)[], orientation: 'portrait' | 'landscape' }[] = [];
  let currentChunkChildren: (Paragraph | Table)[] = [];
  let currentOrientation = paper?.orientation || 'portrait';

  for (const obj of docxObjects) {
    // Check for our custom directive object
    if ((obj as any)._type === 'directive' && (obj as any).name === 'orientation') {
      // If we have content in the current chunk, push it before starting a new one
      if (currentChunkChildren.length > 0) {
        contentChunks.push({ children: currentChunkChildren, orientation: currentOrientation as 'portrait' | 'landscape' });
      }
      // Start a new chunk with the new orientation
      currentChunkChildren = [];
      currentOrientation = (obj as any).value;
    } else {
      // Add regular docx objects to the current chunk
      currentChunkChildren.push(obj as Paragraph | Table);
    }
  }
  // Add the last chunk of content
  if (currentChunkChildren.length > 0) {
    contentChunks.push({ children: currentChunkChildren, orientation: currentOrientation as 'portrait' | 'landscape' });
  }

  // 4. Add Table of Contents to the first content chunk
  const toc = new TableOfContents("Table of Contents", {
    hyperlink: true,
    headingStyleRange: "1-6",
  });

  if (contentChunks.length > 0) {
    contentChunks[0].children.unshift(toc);
  } else {
    // If there's no content, but maybe a cover page, create a section for the TOC
    contentChunks.push({
        children: [toc],
        orientation: paper?.orientation || 'portrait'
    });
  }

  // 5. Create a docx section for each content chunk
  const hasCoverPage = sections.length > 0;
  contentChunks.forEach((chunk, index) => {
    const isFirstContentSection = index === 0;

    const section: ISectionOptions = {
        properties: {
            type: SectionType.NEXT_PAGE,
            page: {
                margin: paper?.margins,
                size: paper?.size,
                orientation: chunk.orientation,
            },
            // This property enables the "Different First Page" feature in Word
            titlePage: hasCoverPage && isFirstContentSection ? !!(header?.first || footer?.first) : false,
        },
        // Apply first page header/footer only to the first content section if a cover page exists
        headers: hasCoverPage && isFirstContentSection ? headerConfiguration : { default: headerConfiguration.default },
        footers: hasCoverPage && isFirstContentSection ? footerConfiguration : { default: footerConfiguration.default },
        children: chunk.children,
    };
    sections.push(section);
  });

  const doc = new Document({
    styles: finalStyles,
    numbering: numbering,
    footnotes: docxFootnotes,
    sections: sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

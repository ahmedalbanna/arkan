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
  SimpleField,
  IRunOptions
} from 'docx';
import { saveAs } from 'file-saver';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root, List, PhrasingContent, RootContent, FootnoteDefinition } from 'mdast';
import { getProxiedImageBuffer, processPlantUml } from '@/lib/utils';

// Define a type for inline styling options to avoid `any`
type InlineStyleOptions = Pick<IRunOptions, "bold" | "italics" | "strike" | "style">;

// Helper to convert markdown AST nodes to docx TextRun arrays
async function transformInlines(
  nodes: PhrasingContent[],
  footnoteIdMap: Map<string, number>,
  options: InlineStyleOptions = {}
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
      case 'delete':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, strike: true })));
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

// Custom type for internal directives to manage page orientation
type OrientationDirective = {
  _type: 'directive';
  name: 'orientation';
  value: 'portrait' | 'landscape';
};
type DocxObject = Paragraph | Table | OrientationDirective;

/**
 * Processes footnote definitions from the AST.
 * @param ast The root of the markdown AST.
 * @returns An object containing the footnote ID map and the docx footnotes configuration.
 */
async function processFootnotes(ast: Root): Promise<{ footnoteIdMap: Map<string, number>, docxFootnotes: IFootnotesOptions }> {
  const footnoteIdMap = new Map<string, number>();
  const docxFootnotes: IFootnotesOptions = {};
  let footnoteCounter = 1;

  const footnoteDefs = ast.children.filter(
    (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
  );

  for (const node of footnoteDefs) {
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

  return { footnoteIdMap, docxFootnotes };
}

/**
 * Converts the main markdown AST nodes into an array of docx objects.
 * @param ast The root of the markdown AST.
 * @param footnoteIdMap A map of footnote identifiers to their generated IDs.
 * @returns A promise that resolves to an array of docx objects.
 */
async function convertAstToDocxObjects(ast: Root, footnoteIdMap: Map<string, number>): Promise<DocxObject[]> {
  const docxObjects: DocxObject[] = [];

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
            children: await transformInlines(node.children, footnoteIdMap),
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
                  new SimpleField(`SEQ Figure \\* ARABIC`),
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
            children: await transformInlines(node.children, footnoteIdMap),
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
  return docxObjects;
}

/**
 * Parses markdown, processes it, and creates an array of docx objects and footnotes.
 * @param markdown The markdown string to convert.
 * @returns An object containing the generated docxObjects and docxFootnotes.
 */
async function createDocxContent(markdown: string) {
  const processedMarkdown = processPlantUml(markdown);
  const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as Root;

  const { footnoteIdMap, docxFootnotes } = await processFootnotes(ast);
  const docxObjects = await convertAstToDocxObjects(ast, footnoteIdMap);

  return { docxObjects, docxFootnotes };
}

interface HeaderFooterContent {
  default?: (Paragraph | Table)[];
  first?: (Paragraph | Table)[];
}

interface ConversionOptions {
  styles?: IStylesOptions;
  paper?: {
    size?: { width: number; height: number };
    margins?: { top: number; right: number; bottom: number; left: number };
    orientation?: 'portrait' | 'landscape';
  };
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
 * Prepares the header and footer configuration objects for the docx document.
 * @param options The conversion options containing header, footer, watermark, and page number settings.
 * @returns An object with `headerConfiguration` and `footerConfiguration`.
 */
function prepareHeadersAndFooters(options: ConversionOptions): {
  headerConfiguration: { first?: Header; default?: Header };
  footerConfiguration: { first?: Footer; default?: Footer };
} {
  const { header, footer, watermark, pageNumbers } = options;

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

  return { headerConfiguration, footerConfiguration };
}

/**
 * Builds the array of ISectionOptions for the docx document.
 * This includes handling cover pages, splitting content by orientation, and adding a Table of Contents.
 * @param docxObjects The array of generated docx objects for the main content.
 * @param options The conversion options.
 * @param headerConfiguration The prepared header configuration.
 * @param footerConfiguration The prepared footer configuration.
 * @returns A promise that resolves to an array of ISectionOptions.
 */
async function buildDocumentSections(
  docxObjects: DocxObject[],
  options: ConversionOptions,
  headerConfiguration: { first?: Header; default?: Header },
  footerConfiguration: { first?: Footer; default?: Footer }
): Promise<ISectionOptions[]> {
  const { paper, coverPageMarkdown } = options;
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

  // 2. Split content into chunks based on orientation directives
  const contentChunks: { children: (Paragraph | Table)[]; orientation: 'portrait' | 'landscape' }[] = [];
  let currentChunkChildren: (Paragraph | Table)[] = [];
  let currentOrientation = paper?.orientation || 'portrait';

  for (const obj of docxObjects) {
    if ('_type' in obj && obj._type === 'directive') {
      if (currentChunkChildren.length > 0) {
        contentChunks.push({ children: currentChunkChildren, orientation: currentOrientation });
      }
      currentChunkChildren = [];
      currentOrientation = obj.value;
    } else {
      currentChunkChildren.push(obj as Paragraph | Table);
    }
  }
  if (currentChunkChildren.length > 0) {
    contentChunks.push({ children: currentChunkChildren, orientation: currentOrientation });
  }

  // 3. Add Table of Contents to the first content chunk
  const toc = new TableOfContents("Table of Contents", {
    hyperlink: true,
    headingStyleRange: "1-6",
  });

  if (contentChunks.length > 0) {
    contentChunks[0].children.unshift(toc);
  } else {
    contentChunks.push({
      children: [toc],
      orientation: paper?.orientation || 'portrait'
    });
  }

  // 4. Create a docx section for each content chunk
  const hasCoverPage = sections.length > 0;
  contentChunks.forEach((chunk, index) => {
    const isFirstContentSection = index === 0;
    const section: ISectionOptions = {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          margins: paper?.margins,
          size: paper?.size,
          orientation: chunk.orientation,
        },
        titlePage: hasCoverPage && isFirstContentSection ? !!(options.header?.first || options.footer?.first) : false,
      },
      headers: hasCoverPage && isFirstContentSection ? headerConfiguration : { default: headerConfiguration.default },
      footers: hasCoverPage && isFirstContentSection ? footerConfiguration : { default: footerConfiguration.default },
      children: chunk.children,
    };
    sections.push(section);
  });

  return sections;
}

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
  const { styles } = options;
  // Create a mutable copy of styles to avoid side effects on the original options object
  const finalStyles: IStylesOptions = {
    ...styles,
    paragraphStyles: [...(styles?.paragraphStyles || [])],
  };

  // Ensure Caption style exists for table and figure captions
  const captionStyleExists = finalStyles.paragraphStyles!.some(style => style.id === 'Caption');
  if (!captionStyleExists) {
    finalStyles.paragraphStyles!.push({
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

  const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);

  const sections = await buildDocumentSections(docxObjects, options, headerConfiguration, footerConfiguration);

  const doc = new Document({
    styles: finalStyles,
    numbering: numbering,
    footnotes: docxFootnotes,
    sections: sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

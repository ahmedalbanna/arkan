// src/lib/markdown-to-word-converter.ts

import { getProxiedImageBuffer, processPlantUml } from '@/lib/utils';
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Footer,
  FootnoteReferenceRun,
  Header,
  HeadingLevel,
  IHeaderOptions,
  INumberingOptions,
  IRunOptions,
  ISectionOptions,
  IStylesOptions,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  SectionType,
  ShadingType,
  SimpleField,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import { FootnoteDefinition, List, PhrasingContent, Root, RootContent } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

// Define font options for different language scripts
interface FontOptions {
  default?: string; // For LTR languages
  rtl?: string;     // For RTL languages like Arabic
  code?: string;    // For code blocks and inline code
}

// Helper to convert markdown AST nodes to docx TextRun arrays
async function transformInlines(
  nodes: PhrasingContent[],
  footnoteIdMap: Map<string, number>,
  options: IRunOptions = {},
  fonts: FontOptions = {}
): Promise<(TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[]> {
  const runs: (TextRun | ImageRun | ExternalHyperlink | FootnoteReferenceRun)[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'strong':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, bold: true }, fonts)));
        break;
      case 'emphasis':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, italics: true }, fonts)));
        break;
      case 'delete':
        runs.push(...(await transformInlines(node.children, footnoteIdMap, { ...options, strike: true }, fonts)));
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
        const linkChildren = await transformInlines(node.children, footnoteIdMap, { ...options, style: 'Hyperlink' }, fonts);
        // The docx ExternalHyperlink can only contain TextRuns. We filter to ensure type safety.
        const textRuns = linkChildren.filter((child): child is TextRun => child instanceof TextRun);
        runs.push(new ExternalHyperlink({
          children: textRuns,
          link: node.url,
        }));
        break;
      }
      case 'inlineCode': {
        const codeFont = fonts.code || 'Courier New';
        runs.push(new TextRun({
          ...options,
          text: node.value,
          font: options.font && typeof options.font === 'object' ? { ...options.font, name: codeFont } : { name: codeFont },
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
async function processFootnotes(
  ast: Root,
  isRtl = false,
  fonts: FontOptions = {}
): Promise<{ footnoteIdMap: Map<string, number>; docxFootnotes: Record<number, { children: Paragraph[] }> }> {
  const footnoteIdMap = new Map<string, number>();
  const docxFootnotes: Record<number, { children: Paragraph[] }> = {};
  let footnoteCounter = 1;

  const footnoteDefs = ast.children.filter(
    (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
  );

  for (const node of footnoteDefs) {
    const id = footnoteCounter++;
    footnoteIdMap.set(node.identifier, id);

    const defaultFontName = isRtl ? fonts.rtl : fonts.default;
    const runOptions: IRunOptions = {
      ...(isRtl && { rightToLeft: true }),
      ...(defaultFontName && { font: { name: defaultFontName } })
    };

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

/**
 * Converts the main markdown AST nodes into an array of docx objects.
 * @param ast The root of the markdown AST.
 * @param footnoteIdMap A map of footnote identifiers to their generated IDs.
 * @returns A promise that resolves to an array of docx objects.
 */
async function convertAstToDocxObjects(ast: Root, footnoteIdMap: Map<string, number>, isRtl = false, fonts: FontOptions = {}): Promise<DocxObject[]> {
  const docxObjects: DocxObject[] = [];

  const defaultFontName = isRtl ? fonts.rtl : fonts.default;
  const baseRunOptions: IRunOptions = {
    ...(isRtl && { rightToLeft: true }),
    ...(defaultFontName && { font: { name: defaultFontName } })
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
            heading: `Heading${node.depth}` as typeof HeadingLevel[keyof typeof HeadingLevel],
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
              new SimpleField(`SEQ Table \\* ARABIC`),
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
            font: { name: codeFont },
            size: 18, // 9pt font for code
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

/**
 * Parses markdown, processes it, and creates an array of docx objects and footnotes.
 * @param markdown The markdown string to convert.
 * @returns An object containing the generated docxObjects and docxFootnotes.
 */
async function createDocxContent(markdown: string, isRtl = false, fonts: FontOptions = {}) {
  const processedMarkdown = processPlantUml(markdown);
  const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as Root;

  const { footnoteIdMap, docxFootnotes } = await processFootnotes(ast, isRtl, fonts);
  const docxObjects = await convertAstToDocxObjects(ast, footnoteIdMap, isRtl, fonts);

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
  isRtl?: boolean;
  fonts?: FontOptions;
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
  const { header, footer, watermark, pageNumbers, isRtl, fonts } = options;

  const headerConfiguration: { first?: Header; default?: Header } = {};
  if (header?.first) {
    headerConfiguration.first = new Header({ children: header.first });
  }
  if (header?.default || watermark) {
    const defaultHeaderOptions: IHeaderOptions = { children: header?.default || [] };
    // Note: watermark property is not available in IHeaderOptions, removing this feature
    headerConfiguration.default = new Header(defaultHeaderOptions);
  }

  const footerConfiguration: { first?: Footer; default?: Footer } = {};
  if (footer?.first) {
    footerConfiguration.first = new Footer({ children: footer.first });
  }
  if (footer?.default || pageNumbers) {
    const defaultFooterChildren = footer?.default ? [...footer.default] : [];
    if (pageNumbers) {
      const defaultFont = isRtl ? fonts?.rtl : fonts?.default;
      const pageNumberParagraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: isRtl,
        children: [
          new TextRun({
            rightToLeft: isRtl,
            children: [PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
            ...(defaultFont && { font: { name: defaultFont } }),
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
      children: coverPageChildren.filter((child): child is Paragraph | Table =>
        child instanceof Paragraph || child instanceof Table
      ),
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
          margin: paper?.margins,
          size: paper?.size,
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
  const { styles, isRtl, fonts = {} } = options;
  // Create a mutable copy of styles to avoid side effects on the original options object
  const existingParagraphStyles = styles?.paragraphStyles || [];
  const captionStyleExists = existingParagraphStyles.some(style => style.id === 'Caption');

  const finalStyles: IStylesOptions = {
    default: styles?.default,
    paragraphStyles: captionStyleExists ? existingParagraphStyles : [
      ...existingParagraphStyles,
      {
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
      }
    ],
    characterStyles: styles?.characterStyles,
  };

  const { docxObjects, docxFootnotes } = await createDocxContent(markdown, isRtl, fonts);

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

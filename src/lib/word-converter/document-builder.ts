// src/lib/word-converter/document-builder.ts

import {
  AlignmentType,
  Footer,
  Header,
  IHeaderOptions,
  ISectionOptions,
  PageNumber,
  Paragraph,
  SectionType,
  Table,
  TableOfContents,
  TextRun,
} from 'docx';
import { ConversionOptions, DocxObject } from './types';

export function prepareHeadersAndFooters(options: ConversionOptions): {
  headerConfiguration: { first?: Header; default?: Header };
  footerConfiguration: { first?: Footer; default?: Footer };
} {
  const { header, footer, watermark, pageNumbers, isRtl, fonts } = options;

  const headerConfiguration: { first?: Header; default?: Header } = {};
  if (header?.first) {
    headerConfiguration.first = new Header({ children: header.first });
  }
  if (header?.default || watermark) {
    const defaultHeaderOptions: IHeaderOptions = {
      children: header?.default || [],
      ...(watermark && {
        watermark: {
          type: 'text',
          text: watermark,
          color: 'E0E0E0', // Lighter grey for subtlety
          font: 'Calibri',
          angle: -45,
        },
      }),
    };
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
      
      // Create a more professional page number format
      const pageNumberParagraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: isRtl,
        spacing: { before: 100 },
        border: {
          top: { style: 'single', size: 4, color: 'D0D0D0' }
        },
        children: [
          new TextRun({
            rightToLeft: isRtl,
            children: [
              isRtl ? "صفحة " : "Page ",
              PageNumber.CURRENT, 
              isRtl ? " من " : " of ", 
              PageNumber.TOTAL_PAGES
            ],
            size: 20, // 10pt
            color: '666666',
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


export async function buildDocumentSections(
  docxObjects: DocxObject[],
  coverPageDocxObjects: DocxObject[],
  options: ConversionOptions,
  headerConfiguration: { first?: Header; default?: Header },
  footerConfiguration: { first?: Footer; default?: Footer }
): Promise<ISectionOptions[]> {
  const { paper, includeToc } = options;
  const sections: ISectionOptions[] = [];

  // 1. Add Cover Page section if it exists
  if (coverPageDocxObjects.length > 0) {
    const coverPageChildren = coverPageDocxObjects.filter((obj): obj is Paragraph | Table => !('_type' in obj));
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

  // 3. Add Table of Contents to the first content chunk if requested
  if (includeToc) {
    // Create a professional TOC title
    const tocTitle = new Paragraph({
      text: "Table of Contents",
      heading: "Heading1",
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      border: {
        bottom: { style: 'single', size: 12, color: '4A90E2' }
      }
    });

    const toc = new TableOfContents("Contents", {
      hyperlink: true,
      headingStyleRange: "1-5", // Limit to 5 levels for cleaner TOC
      stylesWithLevels: [
        { styleName: "Heading1", level: 1 },
        { styleName: "Heading2", level: 2 },
        { styleName: "Heading3", level: 3 },
        { styleName: "Heading4", level: 4 },
        { styleName: "Heading5", level: 5 },
      ]
    });

    // Add spacing after TOC
    const tocSpacer = new Paragraph({ 
      text: "",
      spacing: { before: 240 }
    });

    if (contentChunks.length > 0) {
      // Insert TOC at the beginning with proper formatting
      contentChunks[0].children.unshift(
        tocTitle,
        new Paragraph({ text: "" }), // Small spacer
        toc, 
        tocSpacer,
        new Paragraph({ pageBreakBefore: true }) // Page break after TOC
      );
    } else {
      contentChunks.push({
        children: [tocTitle, new Paragraph({ text: "" }), toc, tocSpacer, new Paragraph({ pageBreakBefore: true })],
        orientation: paper?.orientation || 'portrait'
      });
    }
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
          size: {
            ...paper?.size,
            orientation: chunk.orientation,
          },
        },
        titlePage: hasCoverPage && isFirstContentSection,
      },
      headers: hasCoverPage && isFirstContentSection ? headerConfiguration : { default: headerConfiguration.default },
      footers: hasCoverPage && isFirstContentSection ? footerConfiguration : { default: footerConfiguration.default },
      children: chunk.children,
    };
    sections.push(section);
  });

  return sections;
}

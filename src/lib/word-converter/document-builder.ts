// src/lib/word-converter/document-builder.ts

import {
  Paragraph,
  Table,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  IHeaderOptions,
  ISectionOptions,
  SectionType,
  TableOfContents,
  TextRun,
} from 'docx';
import { ConversionOptions, DocxObject } from './types';
import { createDocxContent } from '../markdown-to-word-converter'; // This will be a circular dependency, need to fix later

/**
 * Prepares the header and footer configuration objects for the docx document.
 * @param options The conversion options containing header, footer, watermark, and page number settings.
 * @returns An object with `headerConfiguration` and `footerConfiguration`.
 */
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
export async function buildDocumentSections(
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

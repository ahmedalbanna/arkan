// src/lib/markdown-to-word-converter.ts

import {
  Document,
  Packer,
  IStylesOptions,
  INumberingOptions,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root } from 'mdast';
import { processPlantUml } from '@/lib/utils/processPlantUml';
import { ConversionOptions, DocxObject } from './word-converter/types';
import { processFootnotes } from './word-converter/node-handlers';
import { convertAstToDocxObjects } from './word-converter/ast-converter';
import { prepareHeadersAndFooters, buildDocumentSections } from './word-converter/document-builder';

/**
 * Parses markdown, processes it, and creates an array of docx objects and footnotes.
 * @param markdown The markdown string to convert.
 * @param options The conversion options.
 * @returns An object containing the generated docxObjects and docxFootnotes.
 */
export async function createDocxContent(markdown: string, options: ConversionOptions = {}) {
  const processedMarkdown = processPlantUml(markdown);
  const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as Root;

  const { footnoteIdMap, docxFootnotes } = await processFootnotes(ast, options);
  const docxObjects = await convertAstToDocxObjects(ast, footnoteIdMap, options);

  return { docxObjects, docxFootnotes };
}

const numbering: INumberingOptions = {
  config: [
    {
      reference: "default-numbering",
      levels: [
        { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START },
        { level: 1, format: "lowerLetter", text: "%2)", alignment: AlignmentType.START },
        { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.START },
        { level: 3, format: "upperLetter", text: "%4)", alignment: AlignmentType.START },
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
  const { styles, coverPageMarkdown } = options;

  const finalStyles: IStylesOptions = {
    ...styles,
    paragraphStyles: [...(styles?.paragraphStyles || [])],
  };

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
        spacing: { before: 120, after: 240 },
      },
    });
  }

  const { docxObjects, docxFootnotes } = await createDocxContent(markdown, options);

  let coverPageDocxObjects: DocxObject[] = [];
  if (coverPageMarkdown && coverPageMarkdown.trim().length > 0) {
    const { docxObjects: convertedCoverPageObjects } = await createDocxContent(coverPageMarkdown, options);
    coverPageDocxObjects = convertedCoverPageObjects;
  }

  const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);

  const sections = await buildDocumentSections(docxObjects, coverPageDocxObjects, options, headerConfiguration, footerConfiguration);

  const doc = new Document({
    styles: finalStyles,
    numbering: numbering,
    footnotes: docxFootnotes,
    sections: sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

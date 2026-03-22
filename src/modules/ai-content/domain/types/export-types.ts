import type { IParagraphOptions, IStylesOptions, Paragraph, Table } from 'docx';

export interface FontOptions {
  default?: string;
  rtl?: string;
  code?: string;
}

export interface CustomStyles {
  codeBlock?: Omit<IParagraphOptions, 'children'>;
  imageParagraph?: Omit<IParagraphOptions, 'children'>;
}

export interface HeaderFooterContent {
  default?: Array<Paragraph | Table>;
  first?: Array<Paragraph | Table>;
}

export interface ConversionOptions {
  styles?: IStylesOptions;
  customStyles?: CustomStyles;
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
  includeToc?: boolean;
  selectedContent?: unknown;
}

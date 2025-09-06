// src/lib/word-converter/types.ts

import { Paragraph, Table, IStylesOptions, Header, Footer, IRunOptions } from 'docx';

// Define font options for different language scripts
export interface FontOptions {
  default?: string; // For LTR languages
  rtl?: string;     // For RTL languages like Arabic
  code?: string;    // For code blocks and inline code
}

// Custom type for internal directives to manage page orientation
export type OrientationDirective = {
  _type: 'directive';
  name: 'orientation';
  value: 'portrait' | 'landscape';
};

export type DocxObject = Paragraph | Table | OrientationDirective;

export interface HeaderFooterContent {
  default?: (Paragraph | Table)[];
  first?: (Paragraph | Table)[];
}

export interface ConversionOptions {
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

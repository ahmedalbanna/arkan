// src/lib/word-converter/types.ts

import { IParagraphOptions, IStylesOptions, Paragraph, Table } from 'docx';

// Define font options for different language scripts
export interface FontOptions {
  default?: string; // For LTR languages
  rtl?: string;     // For RTL languages like Arabic
  code?: string;    // For code blocks and inline code
}

// New interface for custom, non-standard styles that are applied programmatically
export interface CustomStyles {
  codeBlock?: Omit<IParagraphOptions, 'children'>;
  imageParagraph?: Omit<IParagraphOptions, 'children'>;
}

// Defines the structure for a document template
export interface Template {
  id: string;
  name: string;
  description: string;
  styles: IStylesOptions;
  customStyles: CustomStyles;
  imageUrl: string;
  dataAiHint: string;
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
  customStyles?: CustomStyles; // Added to pass template-specific custom styles
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
  selectedContent?: any; // Support for filtering project content
}

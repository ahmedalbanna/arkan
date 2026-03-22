// src/lib/word-converter/types.ts

import { IStylesOptions, Paragraph, Table } from 'docx';
import type {
  ConversionOptions,
  CustomStyles,
  FontOptions,
  HeaderFooterContent,
} from '@/modules/ai-content/domain/types/export-types';

export type {
  ConversionOptions,
  CustomStyles,
  FontOptions,
  HeaderFooterContent,
};

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

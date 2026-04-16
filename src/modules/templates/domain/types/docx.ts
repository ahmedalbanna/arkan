import type { IParagraphOptions } from 'docx';

export interface CustomStyles {
  codeBlock?: Omit<IParagraphOptions, 'children'>;
  imageParagraph?: Omit<IParagraphOptions, 'children'>;
}


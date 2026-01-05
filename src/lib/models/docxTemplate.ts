
import type { IStylesOptions } from 'docx';
import { CustomStyles } from '../word-converter/types';
import { Template, type BaseTemplateProperties } from './template';
import { DocxTemplatePropertiesSchema } from '@/ai/schemas/template-schemas';
import { z } from 'zod';

// The interface now infers from the Zod schema
export interface DocxTemplateProperties extends z.infer<typeof DocxTemplatePropertiesSchema> {
  // We can add any methods or non-serializable properties here if needed
}

export class DocxTemplate extends Template {
  public styles: IStylesOptions;
  public imageUrl: string;
  public dataAiHint: string;
  public customStyles?: CustomStyles;

  constructor(props: DocxTemplateProperties) {
    super(props);
    this.styles = props.styles;
    this.imageUrl = props.imageUrl;
    this.dataAiHint = props.dataAiHint;
    this.customStyles = props.customStyles;
  }
}

import { Template, type BaseTemplateProperties } from './template';
import type { DocxStyleOptions } from '@/ai/schemas/template-schemas';

// Corresponds to DocxTemplateSchema
export interface DocxTemplateProperties extends BaseTemplateProperties {
  styles: DocxStyleOptions;
  imageUrl: string;
  dataAiHint: string;
}

export class DocxTemplate extends Template {
  public styles: DocxStyleOptions;
  public imageUrl: string;
  public dataAiHint: string;

  constructor(props: DocxTemplateProperties) {
    super(props);
    this.styles = props.styles;
    this.imageUrl = props.imageUrl;
    this.dataAiHint = props.dataAiHint;
  }
}

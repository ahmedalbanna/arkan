
import { Template, type BaseTemplateProperties } from './template';
import type { PptxStyleOptions } from '@/lib/types';

// Corresponds to PptxTemplateSchema from the Zod schemas
export interface PptxTemplateProperties extends BaseTemplateProperties {
  styles: PptxStyleOptions;
  imageUrl: string;
  dataAiHint: string;
  templateUrl?: string; // Optional URL to a .pptx file
}

export class PptxTemplate extends Template {
  public styles: PptxStyleOptions;
  public imageUrl: string;
  public dataAiHint: string;
  public templateUrl?: string;

  constructor(props: PptxTemplateProperties) {
    super(props);
    this.styles = props.styles;
    this.imageUrl = props.imageUrl;
    this.dataAiHint = props.dataAiHint;
    this.templateUrl = props.templateUrl;
  }

  public toPlainObject(): PptxTemplateProperties {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      styles: this.styles,
      imageUrl: this.imageUrl,
      dataAiHint: this.dataAiHint,
      templateUrl: this.templateUrl,
    };
  }
}

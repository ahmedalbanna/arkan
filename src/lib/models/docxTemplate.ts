
import { DocxStyleOptions } from '../types';
import { CustomStyles } from '../word-converter/types';
import { Template, type BaseTemplateProperties } from './template';

// Corresponds to DocxTemplateSchema
export interface DocxTemplateProperties extends BaseTemplateProperties {
  styles: DocxStyleOptions;
  imageUrl: string;
  dataAiHint: string;
  customStyles?: CustomStyles;
}

export class DocxTemplate extends Template {
  public styles: DocxStyleOptions;
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


import type { IStylesOptions } from 'docx';
import { Template, type BaseTemplateProperties } from './Template';
import type { CustomStyles } from '../types/docx';

// Corresponds to DocxTemplateSchema
export interface DocxTemplateProperties extends BaseTemplateProperties {
  styles: IStylesOptions;
  imageUrl: string;
  dataAiHint: string;
  customStyles?: CustomStyles;
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

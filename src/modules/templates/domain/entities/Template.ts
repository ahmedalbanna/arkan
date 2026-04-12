
// Base class for all template types, based on BaseTemplateSchema

export interface BaseTemplateProperties<TContent = any> {
  id: string;
  name: string;
  description: string;
  content?: TContent;
  version?: string;
  createdAt?: string;
}

export class Template<TContent = any> implements BaseTemplateProperties<TContent> {
  public id: string;
  public name: string;
  public description: string;
  public content?: TContent;

  constructor(props: BaseTemplateProperties<TContent>) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.content = props.content;
  }
}

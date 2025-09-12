// Base class for all template types, based on BaseTemplateSchema

export interface BaseTemplateProperties {
  id: string;
  name: string;
  description: string;
}

export class Template implements BaseTemplateProperties {
  public id: string;
  public name: string;
  public description: string;

  constructor(props: BaseTemplateProperties) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
  }
}
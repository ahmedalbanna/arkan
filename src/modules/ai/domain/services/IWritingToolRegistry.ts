export interface ToolConfig {
  flow: any;
  schema: any;
  creditCost: number;
  isFreeForGuests?: boolean;
}

export interface IWritingToolRegistry {
  getTool(name: string): ToolConfig | undefined;
  getAllTools(): string[];
}

export const IWritingToolRegistryToken = Symbol('IWritingToolRegistry');


export interface ToolConfig {
  flow: unknown;
  schema: unknown;
  creditCost: number;
  isFreeForGuests?: boolean;
}

export interface IWritingToolRegistry {
  getTool(name: string): ToolConfig | undefined;
  getAllTools(): string[];
}

export const IWritingToolRegistryToken = Symbol('IWritingToolRegistry');


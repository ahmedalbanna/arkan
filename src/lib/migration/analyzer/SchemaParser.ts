import * as fs from 'fs';
import * as path from 'path';

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ParsedSchema {
  name: string;
  fields: SchemaField[];
  extends?: string[];
}

export class SchemaParser {
  private schemaCache: Map<string, ParsedSchema> = new Map();
  private schemaFilePath: string;

  constructor(schemaFilePath?: string) {
    this.schemaFilePath = schemaFilePath || path.join(process.cwd(), 'src/ai/schemas/flows.ts');
  }

  /**
   * Parse a schema definition from the schema file
   */
  public parseSchema(schemaName: string): ParsedSchema | null {
    // Check cache first
    if (this.schemaCache.has(schemaName)) {
      return this.schemaCache.get(schemaName)!;
    }

    try {
      const content = fs.readFileSync(this.schemaFilePath, 'utf-8');
      const schema = this.extractSchemaDefinition(content, schemaName);
      
      if (schema) {
        this.schemaCache.set(schemaName, schema);
      }
      
      return schema;
    } catch (error) {
      console.error(`Error parsing schema ${schemaName}:`, error);
      return null;
    }
  }

  /**
   * Extract schema definition from file content
   */
  private extractSchemaDefinition(content: string, schemaName: string): ParsedSchema | null {
    // Pattern: export const SchemaName = ...;
    // Look for the schema definition until the semicolon
    const schemaPattern = new RegExp(
      `export const ${schemaName}\\s*=\\s*([\\s\\S]+?);`,
      'm'
    );

    const match = content.match(schemaPattern);
    if (!match) {
      return null;
    }

    const schemaDefinition = match[1];
    const fields: SchemaField[] = [];
    const extendsSchemas: string[] = [];

    // IMPORTANT: Extract inline z.object fields FIRST before parsing extended/merged schemas
    // This ensures we get the fields from THIS schema, not from base schemas
    const objectMatch = this.extractObjectFields(schemaDefinition);
    if (objectMatch) {
      const inlineFields = this.extractFields(objectMatch);
      fields.push(...inlineFields);
    }

    // Extract .extend() fields
    const extendMatch = schemaDefinition.match(/\.extend\(\{([^}]+)\}\)/s);
    if (extendMatch) {
      const fieldsContent = extendMatch[1];
      const extendFields = this.extractFields(fieldsContent);
      fields.push(...extendFields);
    }

    // Check if it extends another schema (e.g., BaseTextInputSchema.extend)
    const extendsMatch = schemaDefinition.match(/(\w+Schema)\.extend\(/);
    if (extendsMatch) {
      const baseSchemaName = extendsMatch[1];
      extendsSchemas.push(baseSchemaName);
      
      // Recursively parse the base schema (try base-schemas.ts first)
      const baseSchema = this.parseBaseSchema(baseSchemaName);
      if (baseSchema) {
        fields.push(...baseSchema.fields);
      }
    }

    // Check if it merges with other schemas
    const mergeMatches = schemaDefinition.matchAll(/\.merge\((\w+Schema)\)/g);
    for (const mergeMatch of mergeMatches) {
      const mergedSchemaName = mergeMatch[1];
      extendsSchemas.push(mergedSchemaName);
      
      // Recursively parse the merged schema (try base-schemas.ts first)
      const mergedSchema = this.parseBaseSchema(mergedSchemaName);
      if (mergedSchema) {
        fields.push(...mergedSchema.fields);
      }
    }

    return {
      name: schemaName,
      fields,
      extends: extendsSchemas.length > 0 ? extendsSchemas : undefined,
    };
  }

  /**
   * Extract individual fields from schema content
   */
  private extractFields(fieldsContent: string): SchemaField[] {
    const fields: SchemaField[] = [];
    
    // Split by field boundaries - look for pattern: fieldName: z.type
    // Use a more robust approach: split by commas that aren't inside parentheses
    const fieldDefinitions = this.splitFields(fieldsContent);
    
    for (const fieldDef of fieldDefinitions) {
      const trimmed = fieldDef.trim();
      if (!trimmed) continue;
      
      // Normalize whitespace for easier matching, but keep z. together
      let normalized = trimmed.replace(/\s+/g, ' ');
      // Fix: remove spaces between z and . (e.g., "z .string()" -> "z.string()")
      normalized = normalized.replace(/z\s+\./g, 'z.');
      
      // Extract field name and type - handle multi-line definitions
      const fieldMatch = normalized.match(/(\w+):\s*z\.(\w+)\(/);
      if (!fieldMatch) continue;
      
      const [, fieldName, zodType] = fieldMatch;
      
      // Check if field is optional
      const isOptional = normalized.includes('.optional()');
      const isNullable = normalized.includes('.nullable()');
      
      // Extract description - handle multi-line and escaped quotes
      const descMatch = normalized.match(/\.describe\s*\(\s*['"]([^'"]*(?:\\'|\\"|[^'"])*)['"]\s*[,)]/);
      const description = descMatch ? descMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : '';

      // Map Zod types to simple types
      const type = this.mapZodType(zodType);

      // Build field object - only include description if it exists
      const field: SchemaField = {
        name: fieldName,
        type,
        required: !isOptional && !isNullable,
      };
      
      if (description) {
        field.description = description;
      }

      fields.push(field);
    }

    return fields;
  }

  /**
   * Split field definitions by commas, respecting nested parentheses and strings
   */
  private splitFields(content: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let parenDepth = 0;
    let inString = false;
    let stringChar = '';
    let escaped = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (escaped) {
        currentField += char;
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        currentField += char;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        currentField += char;
      } else if (char === stringChar && inString) {
        inString = false;
        stringChar = '';
        currentField += char;
      } else if (char === '(' && !inString) {
        parenDepth++;
        currentField += char;
      } else if (char === ')' && !inString) {
        parenDepth--;
        currentField += char;
      } else if (char === ',' && parenDepth === 0 && !inString) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    if (currentField.trim()) {
      fields.push(currentField);
    }
    
    return fields;
  }

  /**
   * Extract fields from z.object() with proper brace matching
   */
  private extractObjectFields(schemaDefinition: string): string | null {
    // Handle both "z.object({" and "z\n  .object({" patterns
    const normalized = schemaDefinition.replace(/\s+/g, ' ');
    const objectMatch = normalized.match(/z\s*\.object\s*\(\s*\{/);
    
    if (!objectMatch) return null;
    
    const objectStart = schemaDefinition.indexOf('.object');
    if (objectStart === -1) return null;
    
    // Find the opening brace after .object(
    let searchStart = objectStart;
    let braceCount = 0;
    let inObject = false;
    let startPos = -1;
    
    for (let i = searchStart; i < schemaDefinition.length; i++) {
      if (schemaDefinition[i] === '{') {
        if (!inObject) {
          inObject = true;
          startPos = i + 1;
        }
        braceCount++;
      } else if (schemaDefinition[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inObject) {
          return schemaDefinition.substring(startPos, i);
        }
      }
    }
    
    return null;
  }

  /**
   * Map Zod type names to simple type names
   */
  private mapZodType(zodType: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      array: 'array',
      object: 'object',
      literal: 'string',
      enum: 'string',
      date: 'date',
      any: 'any',
    };

    return typeMap[zodType] || zodType;
  }

  /**
   * Get all fields for a schema including base and merged schemas
   */
  public getAllFields(schemaName: string): SchemaField[] {
    const schema = this.parseSchema(schemaName);
    return schema ? schema.fields : [];
  }

  /**
   * Parse base schema files (base-schemas.ts)
   */
  public parseBaseSchema(schemaName: string): ParsedSchema | null {
    if (this.schemaCache.has(schemaName)) {
      return this.schemaCache.get(schemaName)!;
    }

    try {
      const baseSchemaPath = path.join(process.cwd(), 'src/ai/schemas/base-schemas.ts');
      const content = fs.readFileSync(baseSchemaPath, 'utf-8');
      const schema = this.extractSchemaDefinition(content, schemaName);
      
      if (schema) {
        this.schemaCache.set(schemaName, schema);
      }
      
      return schema;
    } catch (error) {
      // If not found in base-schemas, try flows.ts
      return this.parseSchema(schemaName);
    }
  }
}

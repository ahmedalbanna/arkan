/**
 * Schema Validator
 * Week 1 - Day 3-4: Context Manager & Validator
 * 
 * Provides schema validation utilities for dynamic flows.
 * Generates and validates Zod schemas dynamically from configuration.
 */

import { z, ZodSchema, ZodTypeAny } from 'zod';
import type { 
  SchemaDefinition, 
  SchemaField, 
  SchemaFieldType,
  ValidationRule 
} from '../../lib/models/flow-config';

// ============================================================================
// Schema Validator Class
// ============================================================================

export class SchemaValidator {
  /**
   * Generate a Zod schema from a schema definition
   */
  static generateZodSchema(definition: SchemaDefinition): ZodSchema {
    if (definition.type !== 'zod') {
      throw new Error(`Unsupported schema type: ${definition.type}`);
    }

    // Create object schema from fields
    const shape: Record<string, ZodTypeAny> = {};

    for (const field of definition.fields) {
      shape[field.name] = this.createFieldSchema(field);
    }

    let schema = z.object(shape);

    // Apply strict mode if not required
    if (!definition.required) {
      schema = schema.partial() as any;
    }

    return schema;
  }

  /**
   * Create a Zod schema for a single field
   */
  private static createFieldSchema(field: SchemaField): ZodTypeAny {
    let schema: ZodTypeAny;

    // Create base schema based on type
    switch (field.type) {
      case 'string':
        schema = z.string();
        break;

      case 'number':
        schema = z.number();
        break;

      case 'boolean':
        schema = z.boolean();
        break;

      case 'date':
        schema = z.date();
        break;

      case 'array':
        if (field.items && field.items.length > 0) {
          const itemSchema = this.createFieldSchema(field.items[0]);
          schema = z.array(itemSchema);
        } else {
          schema = z.array(z.any());
        }
        break;

      case 'object':
        if (field.items && field.items.length > 0) {
          const shape: Record<string, ZodTypeAny> = {};
          for (const item of field.items) {
            shape[item.name] = this.createFieldSchema(item);
          }
          schema = z.object(shape);
        } else {
          schema = z.record(z.any());
        }
        break;

      case 'enum':
        if (field.enumValues && field.enumValues.length > 0) {
          schema = z.enum(field.enumValues as [string, ...string[]]);
        } else {
          throw new Error(`Enum field ${field.name} must have enumValues`);
        }
        break;

      case 'file':
        // File can be represented as a string (URL/path) or object
        schema = z.union([
          z.string(),
          z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string().optional(),
          })
        ]);
        break;

      case 'any':
      default:
        schema = z.any();
        break;
    }

    // Apply validation rules
    if (field.validation && field.validation.length > 0) {
      schema = this.applyValidationRules(schema, field.validation, field.type);
    }

    // Apply default value
    if (field.defaultValue !== undefined) {
      schema = schema.default(field.defaultValue);
    }

    // Handle required/optional
    if (!field.required) {
      schema = schema.optional();
    }

    // Add description
    if (field.description) {
      schema = schema.describe(field.description);
    }

    return schema;
  }

  /**
   * Apply validation rules to a schema
   */
  private static applyValidationRules(
    schema: ZodTypeAny,
    rules: ValidationRule[],
    fieldType: SchemaFieldType
  ): ZodTypeAny {
    let result = schema;

    for (const rule of rules) {
      switch (rule.type) {
        case 'min':
          if (fieldType === 'number') {
            result = (result as z.ZodNumber).min(rule.value, rule.message);
          } else if (fieldType === 'array') {
            result = (result as z.ZodArray<any>).min(rule.value, rule.message);
          }
          break;

        case 'max':
          if (fieldType === 'number') {
            result = (result as z.ZodNumber).max(rule.value, rule.message);
          } else if (fieldType === 'array') {
            result = (result as z.ZodArray<any>).max(rule.value, rule.message);
          }
          break;

        case 'minLength':
          if (fieldType === 'string') {
            result = (result as z.ZodString).min(rule.value, rule.message);
          }
          break;

        case 'maxLength':
          if (fieldType === 'string') {
            result = (result as z.ZodString).max(rule.value, rule.message);
          }
          break;

        case 'pattern':
          if (fieldType === 'string') {
            const regex = new RegExp(rule.value);
            result = (result as z.ZodString).regex(regex, rule.message);
          }
          break;

        case 'email':
          if (fieldType === 'string') {
            result = (result as z.ZodString).email(rule.message);
          }
          break;

        case 'url':
          if (fieldType === 'string') {
            result = (result as z.ZodString).url(rule.message);
          }
          break;

        case 'custom':
          // Custom validation would require function evaluation
          // For security, we don't support this directly
          console.warn('Custom validation rules are not supported in dynamic schemas');
          break;
      }
    }

    return result;
  }

  /**
   * Validate data against a schema definition
   */
  static validate(data: any, definition: SchemaDefinition): ValidationResult {
    try {
      const schema = this.generateZodSchema(definition);
      const result = schema.parse(data);
      
      return {
        success: true,
        data: result,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        };
      }

      return {
        success: false,
        data: null,
        errors: [{
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: 'unknown',
        }],
      };
    }
  }

  /**
   * Validate data against a schema definition (async version)
   */
  static async validateAsync(data: any, definition: SchemaDefinition): Promise<ValidationResult> {
    try {
      const schema = this.generateZodSchema(definition);
      const result = await schema.parseAsync(data);
      
      return {
        success: true,
        data: result,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        };
      }

      return {
        success: false,
        data: null,
        errors: [{
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: 'unknown',
        }],
      };
    }
  }

  /**
   * Safe parse - returns result without throwing
   */
  static safeParse(data: any, definition: SchemaDefinition): SafeParseResult {
    const result = this.validate(data, definition);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.errors };
    }
  }

  /**
   * Check if data matches schema (returns boolean only)
   */
  static matches(data: any, definition: SchemaDefinition): boolean {
    const result = this.validate(data, definition);
    return result.success;
  }

  /**
   * Get schema as JSON schema format (for documentation/UI)
   */
  static toJSONSchema(definition: SchemaDefinition): Record<string, any> {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of definition.fields) {
      properties[field.name] = this.fieldToJSONSchema(field);
      
      if (field.required) {
        required.push(field.name);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: !definition.required,
    };
  }

  /**
   * Convert a field to JSON schema format
   */
  private static fieldToJSONSchema(field: SchemaField): Record<string, any> {
    const schema: Record<string, any> = {
      type: this.mapTypeToJSONSchema(field.type),
      description: field.description,
    };

    if (field.defaultValue !== undefined) {
      schema.default = field.defaultValue;
    }

    if (field.type === 'enum' && field.enumValues) {
      schema.enum = field.enumValues;
    }

    if (field.type === 'array' && field.items && field.items.length > 0) {
      schema.items = this.fieldToJSONSchema(field.items[0]);
    }

    if (field.type === 'object' && field.items) {
      const properties: Record<string, any> = {};
      for (const item of field.items) {
        properties[item.name] = this.fieldToJSONSchema(item);
      }
      schema.properties = properties;
    }

    // Apply validation rules to schema
    if (field.validation) {
      for (const rule of field.validation) {
        switch (rule.type) {
          case 'min':
          case 'minLength':
            schema.minimum = rule.value;
            schema.minLength = rule.value;
            break;
          case 'max':
          case 'maxLength':
            schema.maximum = rule.value;
            schema.maxLength = rule.value;
            break;
          case 'pattern':
            schema.pattern = rule.value;
            break;
          case 'email':
            schema.format = 'email';
            break;
          case 'url':
            schema.format = 'uri';
            break;
        }
      }
    }

    return schema;
  }

  /**
   * Map field type to JSON schema type
   */
  private static mapTypeToJSONSchema(type: SchemaFieldType): string {
    const map: Record<SchemaFieldType, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string', // ISO string
      array: 'array',
      object: 'object',
      enum: 'string',
      file: 'object',
      any: 'any',
    };

    return map[type] || 'any';
  }

  /**
   * Create a default value for a schema
   */
  static createDefaultValue(definition: SchemaDefinition): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of definition.fields) {
      if (field.defaultValue !== undefined) {
        result[field.name] = field.defaultValue;
      } else if (field.required) {
        result[field.name] = this.getDefaultValueForType(field.type);
      }
    }

    return result;
  }

  /**
   * Get default value for a field type
   */
  private static getDefaultValueForType(type: SchemaFieldType): any {
    const defaults: Record<SchemaFieldType, any> = {
      string: '',
      number: 0,
      boolean: false,
      date: new Date(),
      array: [],
      object: {},
      enum: '',
      file: null,
      any: null,
    };

    return defaults[type] ?? null;
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  success: boolean;
  data: any;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface SafeParseResult {
  success: boolean;
  data?: any;
  error?: ValidationError[];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick validation function
 */
export function validateData(data: any, definition: SchemaDefinition): ValidationResult {
  return SchemaValidator.validate(data, definition);
}

/**
 * Quick schema generation function
 */
export function createSchema(definition: SchemaDefinition): ZodSchema {
  return SchemaValidator.generateZodSchema(definition);
}

/**
 * Check if data is valid
 */
export function isValid(data: any, definition: SchemaDefinition): boolean {
  return SchemaValidator.matches(data, definition);
}

// Export the class and types
export type { SchemaDefinition, SchemaField, ValidationRule };

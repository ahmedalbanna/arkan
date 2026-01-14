/**
 * Schema Validator
 * 
 * Validates data against schemas defined in flow configurations.
 * Supports dynamic Zod schema generation from JSON schema definitions.
 */

import { z, ZodSchema, ZodType, ZodTypeAny } from 'zod';

/**
 * JSON schema type definitions
 */
interface JsonSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  
  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  uuid?: boolean;
  
  // Number constraints
  min?: number;
  max?: number;
  int?: boolean;
  positive?: boolean;
  negative?: boolean;
  
  // Array constraints
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  
  // Object constraints
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  
  // Enum
  enum?: any[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  path: string[];
  message: string;
  code?: string;
}

/**
 * Schema Validator class
 */
export class SchemaValidator {
  /**
   * Validate data against a JSON schema
   */
  validate(data: any, schemaDefinition: Record<string, any>): ValidationResult {
    try {
      // Convert JSON schema to Zod schema
      const zodSchema = this.jsonSchemaToZod(schemaDefinition);
      
      // Validate data
      const result = zodSchema.safeParse(data);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        return {
          success: false,
          errors: this.formatZodErrors(result.error),
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          path: [],
          message: error instanceof Error ? error.message : 'Unknown validation error',
        } as unknown as ValidationError],
      };
    }
  }

  /**
   * Convert JSON schema to Zod schema
   */
  private jsonSchemaToZod(schema: JsonSchema | Record<string, any>): ZodTypeAny {
    // Handle empty schema
    if (!schema || Object.keys(schema).length === 0) {
      return z.any();
    }

    // If schema has 'type' property, treat as single type schema
    if ('type' in schema) {
      return this.buildZodType(schema as JsonSchema);
    }

    // Otherwise, treat as object schema with properties
    if ('properties' in schema || typeof schema === 'object') {
      return this.buildObjectSchema(schema);
    }

    return z.any();
  }

  /**
   * Build Zod type from JSON schema
   */
  private buildZodType(schema: JsonSchema): ZodTypeAny {
    let zodType: ZodTypeAny;

    // Base type
    switch (schema.type) {
      case 'string':
        zodType = this.buildStringSchema(schema);
        break;
      case 'number':
        zodType = this.buildNumberSchema(schema);
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'array':
        zodType = this.buildArraySchema(schema);
        break;
      case 'object':
        zodType = this.buildObjectSchema(schema);
        break;
      case 'any':
      default:
        zodType = z.any();
    }

    // Apply modifiers
    if (schema.optional) {
      zodType = zodType.optional();
    }

    if (schema.nullable) {
      zodType = zodType.nullable();
    }

    if (schema.default !== undefined) {
      zodType = zodType.default(schema.default);
    }

    if (schema.description) {
      zodType = zodType.describe(schema.description);
    }

    return zodType;
  }

  /**
   * Build string schema
   */
  private buildStringSchema(schema: JsonSchema): ZodType {
    let stringSchema = z.string();

    if (schema.minLength !== undefined) {
      stringSchema = stringSchema.min(schema.minLength);
    }

    if (schema.maxLength !== undefined) {
      stringSchema = stringSchema.max(schema.maxLength);
    }

    if (schema.pattern) {
      stringSchema = stringSchema.regex(new RegExp(schema.pattern));
    }

    if (schema.email) {
      stringSchema = stringSchema.email();
    }

    if (schema.url) {
      stringSchema = stringSchema.url();
    }

    if (schema.uuid) {
      stringSchema = stringSchema.uuid();
    }

    if (schema.enum) {
      return z.enum(schema.enum as [string, ...string[]]);
    }

    return stringSchema;
  }

  /**
   * Build number schema
   */
  private buildNumberSchema(schema: JsonSchema): ZodType {
    let numberSchema = schema.int ? z.number().int() : z.number();

    if (schema.min !== undefined) {
      numberSchema = numberSchema.min(schema.min);
    }

    if (schema.max !== undefined) {
      numberSchema = numberSchema.max(schema.max);
    }

    if (schema.positive) {
      numberSchema = numberSchema.positive();
    }

    if (schema.negative) {
      numberSchema = numberSchema.negative();
    }

    if (schema.enum) {
      return z.enum(schema.enum as [string, ...string[]]);
    }

    return numberSchema;
  }

  /**
   * Build array schema
   */
  private buildArraySchema(schema: JsonSchema): ZodType {
    let itemSchema: ZodTypeAny = z.any();

    if (schema.items) {
      itemSchema = this.buildZodType(schema.items);
    }

    let arraySchema = z.array(itemSchema);

    if (schema.minItems !== undefined) {
      arraySchema = arraySchema.min(schema.minItems);
    }

    if (schema.maxItems !== undefined) {
      arraySchema = arraySchema.max(schema.maxItems);
    }

    return arraySchema;
  }

  /**
   * Build object schema
   */
  private buildObjectSchema(schema: Record<string, any>): ZodType {
    const shape: Record<string, ZodTypeAny> = {};

    const properties = schema.properties || schema;
    const required = schema.required || [];

    for (const [key, propSchema] of Object.entries(properties)) {
      if (typeof propSchema === 'object' && propSchema !== null) {
        // Mark as optional if not in required array
        const isRequired = required.includes(key);
        const prop = propSchema as JsonSchema;
        
        if (!isRequired && !prop.optional) {
          prop.optional = true;
        }

        shape[key] = this.buildZodType(prop);
      } else {
        shape[key] = z.any();
      }
    }

    let objectSchema: any = z.object(shape);

    // Handle additional properties
    if (schema.additionalProperties === false) {
      objectSchema = objectSchema.strict();
    }

    return objectSchema as z.ZodType<any>;
  }

  /**
   * Format Zod errors to standard format
   */
  private formatZodErrors(zodError: z.ZodError): ValidationError[] {
    return zodError.errors.map(error => ({
      path: error.path.map(p => String(p)),
      message: error.message,
      code: error.code,
    } as ValidationError));
  }

  /**
   * Validate and transform data
   */
  validateAndTransform(data: any, schemaDefinition: Record<string, any>): any {
    const result = this.validate(data, schemaDefinition);
    
    if (!result.success) {
      const errorMessages = result.errors?.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      throw new ValidationError(
        `Validation failed: ${errorMessages}`,
        result.errors || []
      );
    }
    
    return result.data;
  }

  /**
   * Validate input for a step
   */
  validateStepInput(
    input: any,
    stepSchema: Record<string, any>,
    stepName: string
  ): any {
    try {
      return this.validateAndTransform(input, stepSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new StepValidationError(stepName, 'input', error.errors);
      }
      throw error;
    }
  }

  /**
   * Validate output from a step
   */
  validateStepOutput(
    output: any,
    stepSchema: Record<string, any>,
    stepName: string
  ): any {
    try {
      return this.validateAndTransform(output, stepSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new StepValidationError(stepName, 'output', error.errors);
      }
      throw error;
    }
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class StepValidationError extends Error {
  public readonly stepName: string;
  public readonly validationType: 'input' | 'output';
  public readonly errors: ValidationError[];

  constructor(stepName: string, validationType: 'input' | 'output', errors: ValidationError[]) {
    const errorMessages = errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    super(`Step "${stepName}" ${validationType} validation failed: ${errorMessages}`);
    this.name = 'StepValidationError';
    this.stepName = stepName;
    this.validationType = validationType;
    this.errors = errors;
  }
}

/**
 * Singleton instance
 */
export const schemaValidator = new SchemaValidator();

/**
 * Convenience function to validate data
 */
export function validateSchema(data: any, schema: Record<string, any>): any {
  return schemaValidator.validateAndTransform(data, schema);
}

/**
 * Check if data matches schema without throwing
 */
export function isValidSchema(data: any, schema: Record<string, any>): boolean {
  const result = schemaValidator.validate(data, schema);
  return result.success;
}

/**
 * Get validation errors without throwing
 */
export function getValidationErrors(
  data: any,
  schema: Record<string, any>
): ValidationError[] {
  const result = schemaValidator.validate(data, schema);
  return result.errors || [];
}

/**
 * Create a reusable validator function
 */
export function createValidator(schema: Record<string, any>): (data: any) => any {
  return (data: any) => validateSchema(data, schema);
}

/**
 * Merge multiple schemas
 */
export function mergeSchemas(...schemas: Record<string, any>[]): Record<string, any> {
  const merged: Record<string, any> = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const schema of schemas) {
    if (schema.properties) {
      merged.properties = { ...merged.properties, ...schema.properties };
    }
    
    if (schema.required) {
      merged.required = [...new Set([...merged.required, ...schema.required])];
    }
  }

  return merged;
}

/**
 * Helper to create common schemas
 */
export const CommonSchemas = {
  string: (opts?: { min?: number; max?: number; pattern?: string }): JsonSchema => ({
    type: 'string',
    minLength: opts?.min,
    maxLength: opts?.max,
    pattern: opts?.pattern,
  }),

  number: (opts?: { min?: number; max?: number; int?: boolean }): JsonSchema => ({
    type: 'number',
    min: opts?.min,
    max: opts?.max,
    int: opts?.int,
  }),

  boolean: (): JsonSchema => ({
    type: 'boolean',
  }),

  array: (items?: JsonSchema, opts?: { min?: number; max?: number }): JsonSchema => ({
    type: 'array',
    items: items || { type: 'any' },
    minItems: opts?.min,
    maxItems: opts?.max,
  }),

  object: (properties: Record<string, JsonSchema>, required?: string[]): JsonSchema => ({
    type: 'object',
    properties,
    required,
  }),

  email: (): JsonSchema => ({
    type: 'string',
    email: true,
  }),

  url: (): JsonSchema => ({
    type: 'string',
    url: true,
  }),

  enum: (values: string[]): JsonSchema => ({
    type: 'string',
    enum: values,
  }),

  optional: (schema: JsonSchema): JsonSchema => ({
    ...schema,
    optional: true,
  }),

  nullable: (schema: JsonSchema): JsonSchema => ({
    ...schema,
    nullable: true,
  }),
};

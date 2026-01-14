/**
 * Schema Validator Tests
 * Week 1 - Day 3-4: Testing Schema Validator
 */

import { SchemaValidator, validateData, createSchema, isValid } from '../schema-validator';
import type { SchemaDefinition } from '../../../lib/models/flow-config';

describe('SchemaValidator', () => {
  describe('String Field Validation', () => {
    test('should validate required string field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate({ name: 'Ahmed' }, schema);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Ahmed');
    });

    test('should fail validation for missing required field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate({}, schema);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate optional string field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'description',
            type: 'string',
            label: 'Description',
            required: false,
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ description: 'Test' }, schema);
      expect(result1.success).toBe(true);

      const result2 = SchemaValidator.validate({}, schema);
      expect(result2.success).toBe(true);
    });

    test('should validate string with minLength', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'password',
            type: 'string',
            label: 'Password',
            required: true,
            validation: [
              {
                type: 'minLength',
                value: 8,
                message: 'Password must be at least 8 characters',
              }
            ],
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ password: 'short' }, schema);
      expect(result1.success).toBe(false);

      const result2 = SchemaValidator.validate({ password: 'longpassword' }, schema);
      expect(result2.success).toBe(true);
    });

    test('should validate email format', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'email',
            type: 'string',
            label: 'Email',
            required: true,
            validation: [
              {
                type: 'email',
                message: 'Invalid email format',
              }
            ],
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ email: 'invalid' }, schema);
      expect(result1.success).toBe(false);

      const result2 = SchemaValidator.validate({ email: 'test@example.com' }, schema);
      expect(result2.success).toBe(true);
    });
  });

  describe('Number Field Validation', () => {
    test('should validate number field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'age',
            type: 'number',
            label: 'Age',
            required: true,
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate({ age: 25 }, schema);
      expect(result.success).toBe(true);
      expect(result.data.age).toBe(25);
    });

    test('should validate number with min/max', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'rating',
            type: 'number',
            label: 'Rating',
            required: true,
            validation: [
              { type: 'min', value: 1, message: 'Min is 1' },
              { type: 'max', value: 5, message: 'Max is 5' },
            ],
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ rating: 0 }, schema);
      expect(result1.success).toBe(false);

      const result2 = SchemaValidator.validate({ rating: 3 }, schema);
      expect(result2.success).toBe(true);

      const result3 = SchemaValidator.validate({ rating: 6 }, schema);
      expect(result3.success).toBe(false);
    });
  });

  describe('Boolean Field Validation', () => {
    test('should validate boolean field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'active',
            type: 'boolean',
            label: 'Active',
            required: true,
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ active: true }, schema);
      expect(result1.success).toBe(true);
      expect(result1.data.active).toBe(true);

      const result2 = SchemaValidator.validate({ active: false }, schema);
      expect(result2.success).toBe(true);
      expect(result2.data.active).toBe(false);
    });
  });

  describe('Array Field Validation', () => {
    test('should validate array field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'tags',
            type: 'array',
            label: 'Tags',
            required: true,
            items: [
              {
                name: 'tag',
                type: 'string',
                label: 'Tag',
                required: true,
              }
            ],
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate({ tags: ['tag1', 'tag2'] }, schema);
      expect(result.success).toBe(true);
      expect(result.data.tags).toEqual(['tag1', 'tag2']);
    });

    test('should validate array with min/max items', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'items',
            type: 'array',
            label: 'Items',
            required: true,
            validation: [
              { type: 'min', value: 2, message: 'Min 2 items' },
              { type: 'max', value: 5, message: 'Max 5 items' },
            ],
            items: [
              {
                name: 'item',
                type: 'string',
                label: 'Item',
                required: true,
              }
            ],
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ items: ['one'] }, schema);
      expect(result1.success).toBe(false);

      const result2 = SchemaValidator.validate({ items: ['one', 'two', 'three'] }, schema);
      expect(result2.success).toBe(true);
    });
  });

  describe('Object Field Validation', () => {
    test('should validate nested object', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'user',
            type: 'object',
            label: 'User',
            required: true,
            items: [
              {
                name: 'name',
                type: 'string',
                label: 'Name',
                required: true,
              },
              {
                name: 'age',
                type: 'number',
                label: 'Age',
                required: true,
              }
            ],
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate(
        { user: { name: 'Ahmed', age: 25 } },
        schema
      );
      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('Ahmed');
    });
  });

  describe('Enum Field Validation', () => {
    test('should validate enum field', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'status',
            type: 'enum',
            label: 'Status',
            required: true,
            enumValues: ['active', 'inactive', 'pending'],
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.validate({ status: 'active' }, schema);
      expect(result1.success).toBe(true);

      const result2 = SchemaValidator.validate({ status: 'invalid' }, schema);
      expect(result2.success).toBe(false);
    });
  });

  describe('Default Values', () => {
    test('should apply default values', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: false,
            defaultValue: 'Guest',
          },
          {
            name: 'age',
            type: 'number',
            label: 'Age',
            required: false,
            defaultValue: 18,
          }
        ],
        required: true,
      };

      const result = SchemaValidator.validate({}, schema);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Guest');
      expect(result.data.age).toBe(18);
    });
  });

  describe('JSON Schema Conversion', () => {
    test('should convert to JSON schema', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
            description: 'User name',
          },
          {
            name: 'age',
            type: 'number',
            label: 'Age',
            required: false,
          }
        ],
        required: true,
      };

      const jsonSchema = SchemaValidator.toJSONSchema(schema);
      
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties.name.type).toBe('string');
      expect(jsonSchema.properties.name.description).toBe('User name');
      expect(jsonSchema.required).toContain('name');
      expect(jsonSchema.required).not.toContain('age');
    });
  });

  describe('Utility Functions', () => {
    test('validateData should work', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      const result = validateData({ name: 'Ahmed' }, schema);
      expect(result.success).toBe(true);
    });

    test('isValid should return boolean', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      expect(isValid({ name: 'Ahmed' }, schema)).toBe(true);
      expect(isValid({}, schema)).toBe(false);
    });

    test('createSchema should generate Zod schema', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      const zodSchema = createSchema(schema);
      expect(zodSchema).toBeDefined();
      
      const result = zodSchema.safeParse({ name: 'Ahmed' });
      expect(result.success).toBe(true);
    });
  });

  describe('Safe Parse', () => {
    test('should return safe parse result', () => {
      const schema: SchemaDefinition = {
        type: 'zod',
        fields: [
          {
            name: 'name',
            type: 'string',
            label: 'Name',
            required: true,
          }
        ],
        required: true,
      };

      const result1 = SchemaValidator.safeParse({ name: 'Ahmed' }, schema);
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.name).toBe('Ahmed');
      }

      const result2 = SchemaValidator.safeParse({}, schema);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBeDefined();
      }
    });
  });
});

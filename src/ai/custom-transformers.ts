/**
 * Custom Transformers
 * Week 2 - Custom transformation functions
 * 
 * Registry for custom data transformation functions used in transform steps.
 */

// ============================================================================
// Custom Transformer Registry
// ============================================================================

type TransformerFunction = (input: any, params: Record<string, any>) => any;

const customTransformers: Map<string, TransformerFunction> = new Map();

/**
 * Register a custom transformer
 */
export function registerCustomTransformer(name: string, fn: TransformerFunction): void {
  if (customTransformers.has(name)) {
    console.warn(`Transformer ${name} already exists, overwriting...`);
  }
  customTransformers.set(name, fn);
}

/**
 * Get a custom transformer
 */
export async function getCustomTransformer(name: string): Promise<TransformerFunction> {
  const transformer = customTransformers.get(name);
  
  if (!transformer) {
    throw new Error(`Custom transformer not found: ${name}`);
  }
  
  return transformer;
}

/**
 * Check if transformer exists
 */
export function hasCustomTransformer(name: string): boolean {
  return customTransformers.has(name);
}

/**
 * List all custom transformers
 */
export function listCustomTransformers(): string[] {
  return Array.from(customTransformers.keys());
}

/**
 * Unregister a custom transformer
 */
export function unregisterCustomTransformer(name: string): boolean {
  return customTransformers.delete(name);
}

// ============================================================================
// Pre-registered Custom Transformers
// ============================================================================

// Example: Extract email addresses from text
registerCustomTransformer('extract-emails', (input: string) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return (input.match(emailRegex) || []);
});

// Example: Extract URLs from text
registerCustomTransformer('extract-urls', (input: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (input.match(urlRegex) || []);
});

// Example: Truncate text
registerCustomTransformer('truncate', (input: string, params: { length: number; suffix?: string }) => {
  const text = String(input);
  if (text.length <= params.length) return text;
  return text.substring(0, params.length) + (params.suffix || '...');
});

// Example: Remove HTML tags
registerCustomTransformer('strip-html', (input: string) => {
  return String(input).replace(/<[^>]*>/g, '');
});

// Example: Count words
registerCustomTransformer('word-count', (input: string) => {
  return String(input).split(/\s+/).filter(w => w.length > 0).length;
});

// Example: Reverse string
registerCustomTransformer('reverse', (input: string) => {
  return String(input).split('').reverse().join('');
});

// Example: Calculate sum of array
registerCustomTransformer('sum', (input: number[]) => {
  if (!Array.isArray(input)) return 0;
  return input.reduce((sum, num) => sum + Number(num), 0);
});

// Example: Calculate average of array
registerCustomTransformer('average', (input: number[]) => {
  if (!Array.isArray(input) || input.length === 0) return 0;
  const sum = input.reduce((sum, num) => sum + Number(num), 0);
  return sum / input.length;
});

// Example: Flatten nested array
registerCustomTransformer('flatten', (input: any[]) => {
  if (!Array.isArray(input)) return [input];
  return input.flat(Infinity);
});

// Example: Remove duplicates from array
registerCustomTransformer('unique', (input: any[]) => {
  if (!Array.isArray(input)) return [input];
  return [...new Set(input)];
});

// Example: Sort array
registerCustomTransformer('sort', (input: any[], params: { order?: 'asc' | 'desc' }) => {
  if (!Array.isArray(input)) return [input];
  const sorted = [...input].sort();
  return params.order === 'desc' ? sorted.reverse() : sorted;
});

// Example: Merge objects
registerCustomTransformer('merge-objects', (input: any[], params: { deep?: boolean }) => {
  if (!Array.isArray(input)) return input;
  if (params.deep) {
    // Deep merge
    return input.reduce((merged, obj) => {
      return deepMerge(merged, obj);
    }, {});
  } else {
    // Shallow merge
    return Object.assign({}, ...input);
  }
});

// Example: Format date
registerCustomTransformer('format-date', (input: Date | string, params: { format?: string }) => {
  const date = input instanceof Date ? input : new Date(input);
  // Simple date formatting (you can use a library like date-fns for more options)
  return date.toISOString();
});

// Example: Slugify text
registerCustomTransformer('slugify', (input: string) => {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
});

// Example: Title case
registerCustomTransformer('title-case', (input: string) => {
  return String(input)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

// ============================================================================
// Helper Functions
// ============================================================================

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

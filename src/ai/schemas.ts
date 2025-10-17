

import { defaultAgentCategories } from '@/lib/agent-categories';

// Extract category IDs for use in Zod enum
const categoryIds = defaultAgentCategories.map(cat => cat.id) as [string, ...string[]];
export * from './schemas/api';
export * from './schemas/enums';
export * from './schemas/flows';
export * from './schemas/lecture-generator';
export * from './schemas/project';
export * from './schemas/state';
export * from './schemas/template-schemas';

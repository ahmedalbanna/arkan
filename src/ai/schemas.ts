
import { defaultAgentCategories } from '@/lib/agent-categories';

// Extract category IDs for use in Zod enum
const categoryIds = defaultAgentCategories.map(cat => cat.id) as [string, ...string[]];

// Default section IDs for a new report
export const DEFAULT_REPORT_SECTION_IDS = [
    "introduction",
    "literatureReview",
    "systemAnalysis",
    "designStrategy",
    "systemDesign",
    "systemProgramming",
    "systemTesting",
    "conclusion",
    "abstract",
    "acknowledgment",
    "recommendations",
    "references",
    "appendices"
];

export * from './schemas/api';
export * from './schemas/enums';
export * from './schemas/flows';
export * from './schemas/lecture-generator';
export * from './schemas/project';
export * from './schemas/state';
export * from './schemas/template-schemas';

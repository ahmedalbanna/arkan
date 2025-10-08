import { z } from 'zod';

export const TaskTypeSchema = z.enum([
    'generation',
    'analysis',
    'translation',
    'improvement',
    'creative',
    'technical'
]);

export type TaskType = z.infer<typeof TaskTypeSchema>;

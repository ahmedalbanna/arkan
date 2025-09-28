import { z } from 'zod';

export const ProjectTaskSchema = z.object({
    title: z.string().describe('A concise title for the task or user story.'),
    description: z.string().describe('A detailed description of the task, explaining what needs to be done.'),
    acceptanceCriteria: z.array(z.string()).describe('A list of specific, measurable criteria that must be met for the task to be considered complete.'),
    status: z.enum(['To Do', 'In Progress', 'Done']).default('To Do').describe('The current status of the task.'),
});
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;

export const ProjectPhaseSchema = z.object({
    phaseName: z.string().describe('The name of the project phase (e.g., "Sprint 1: User Authentication", "Phase 2: UI/UX Design").'),
    tasks: z.array(ProjectTaskSchema).describe('An array of tasks to be completed within this phase.'),
});
export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>;

export const ProjectPlanSchema = z.object({
    phases: z.array(ProjectPhaseSchema).describe('The full list of project phases, each containing a list of tasks.'),
});
export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;

export const ProjectProposalSchema = z.object({
    title: z.string().describe(
        "A clear and descriptive title for the project. This should be engaging and summarize the project's core purpose."
    ),
    category: z.string().describe(
        "A relevant category for the project (e.g., 'Software Development', 'UI/UX Design', 'AI', 'Student Training')."
    ),
}).passthrough();
export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;

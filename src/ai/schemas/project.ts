import { z } from 'zod';

export const ProjectTaskSchema = z.object({
    title: z.string().describe('A concise title for the task or user story.'),
    description: z.string().describe('A detailed description of the task, explaining what needs to be done.'),
    acceptanceCriteria: z.array(z.string()).describe('A list of specific, measurable criteria that must be met for the task to be considered complete.'),
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
    executiveSummary: z.string().describe(
        "A brief, high-level overview of the entire proposal, targeting stakeholders who may not read the full document."
    ),
    problemStatement: z.string().describe(
        "Clearly define the problem or opportunity the project addresses. Explain the pain points and why a solution is necessary now."
    ),
    proposedSolution: z.object({
        overview: z.string().describe("Describe the proposed solution in detail. What will be built or implemented?"),
        technicalApproach: z.string().describe("Explain the technologies, architecture, and methodologies that will be used."),
        keyFeatures: z.string().describe("List the main features and functionalities of the solution."),
    }).describe("The core of the proposal, detailing the solution."),
    projectPlan: z.object({
        timeline: z.string().describe("A detailed timeline with major phases, milestones, and estimated durations. A week-by-week or bi-weekly breakdown is ideal."),
        keyDeliverables: z.string().describe("A list of all tangible outputs the client will receive (e.g., design mockups, functional prototype, final report)."),
    }).describe("How the project will be executed and managed."),
    budgetBreakdown: z.string().describe(
        "Provide a detailed breakdown of all costs, including labor, software, and other expenses. Be transparent about the pricing. Display as Table Markdown."
    ),
});
export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;

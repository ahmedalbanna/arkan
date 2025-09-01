import { z } from 'zod';

// --- Schemas for Theoretical Lecture Generation ---

export const GenerateTheoreticalLectureInputSchema = z.object({
  lectureTopic: z.string().describe("The main topic of the lecture."),
  subTopics: z.array(z.string()).min(1).describe("A list of key sub-topics or sections to be covered in the lecture."),
  professorNotes: z.string().optional().describe("Optional raw notes, key points, or existing materials provided by the professor."),
  targetAudience: z.string().default("University-level students").describe("The intended audience for the lecture."),
});

export const GenerateTheoreticalLectureOutputSchema = z.object({
  lectureContent: z.string().describe("The fully-formed theoretical lecture content in Markdown format, with clear headings and explanations."),
});

export type GenerateTheoreticalLectureInput = z.infer<typeof GenerateTheoreticalLectureInputSchema>;
export type GenerateTheoreticalLectureOutput = z.infer<typeof GenerateTheoreticalLectureOutputSchema>;

// --- Schemas for Practical Session Plan Generation ---

export const HandoutSchema = z.object({
    title: z.string().describe("The title of the handout, e.g., 'Handout 1: Acme Widgets Co. - Departmental Records'."),
    content: z.string().describe("The full content of the handout, formatted in Markdown. This can include tables, scenarios, etc."),
});

export const ActivitySchema = z.object({
    title: z.string().describe('A clear, descriptive title for the activity (e.g., "Unmasking File System Failures").'),
    objective: z.string().describe("The specific, single learning objective this activity is designed to achieve."),
    duration: z.number().int().min(1, 'Duration must be a positive number.').describe('The estimated duration for this activity in minutes, including discussion time.'),
    type: z.enum(['ice-breaker', 'group-discussion', 'hands-on-exercise', 'quiz', 'q-and-a', 'presentation', 'role-play', 'case-study', 'simulation', 'problem-solving-scenario']).describe('The type of interactive activity.'),
    instructions: z.string().describe("A detailed, step-by-step guide for participants. Use markdown for structure (e.g., '### Scenario' and '### Task')."),
    discussion: z.array(z.string()).describe("A list of questions to facilitate a discussion after the activity is complete."),
    exampleLookFor: z.string().optional().describe("A concrete example of a correct or high-quality response to guide the facilitator. For example: 'Limitation: Data Redundancy. Example: Customer ID 1001 is in both spreadsheets.'"),
    materials: z.array(z.string()).optional().describe('A list of materials or resources needed for the activity (e.g., "Whiteboard", "Handout 1").'),
});

export const GenerateSessionPlanInputSchema = z.object({
    chapterContent: z.string().min(100, 'Chapter content must be at least 100 characters long.').describe('The text content of the chapter or topic for the session.'),
    sessionDuration: z.number().int().min(1, 'Session duration must be a positive number.').describe('The total duration of the session in minutes.'),
    numActivities: z.number().int().min(1).max(10).describe('The desired number of interactive activities.'),
    targetAudience: z.string().optional().describe('A brief description of the target audience (e.g., "Beginner developers", "Senior managers").'),
});

export const GenerateSessionPlanOutputSchema = z.object({
    sessionTitle: z.string().describe('A compelling and descriptive title for the training session.'),
    sessionGoals: z.array(z.string()).min(2).describe('A list of 2-3 high-level goals for the session (e.g., "Reinforce understanding of data vs. information").'),
    learningObjectives: z.array(z.string()).min(2).describe('A list of 2-4 specific, measurable learning objectives that participants should be able to do by the end of the session (e.g., "Distinguish between raw data and meaningful information").'),
    activities: z.array(ActivitySchema).describe('An array of interactive activities that make up the session plan.'),
    appendix: z.array(HandoutSchema).optional().describe("An optional appendix containing materials like handouts referenced in the activities."),
    closingSummary: z.string().describe('A brief summary to conclude the session, reinforcing key takeaways and previewing the next topic.'),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type GenerateSessionPlanInput = z.infer<typeof GenerateSessionPlanInputSchema>;
export type GenerateSessionPlanOutput = z.infer<typeof GenerateSessionPlanOutputSchema>;

// --- Schemas for the Orchestrator Flow (create-lecture-unit) ---

export const CreateLectureUnitInputSchema = GenerateTheoreticalLectureInputSchema.merge(
  GenerateSessionPlanInputSchema.pick({
    sessionDuration: true,
    numActivities: true,
  })
);

export const CreateLectureUnitOutputSchema = z.object({
  theoreticalLecture: GenerateTheoreticalLectureOutputSchema,
  practicalSession: GenerateSessionPlanOutputSchema,
});

export type CreateLectureUnitInput = z.infer<typeof CreateLectureUnitInputSchema>;
export type CreateLectureUnitOutput = z.infer<typeof CreateLectureUnitOutputSchema>;

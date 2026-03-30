import {
    aiResearcher, createLectureUnit, generateCitation, generateLiteratureReview,
    generateQuiz, generateTheoreticalLecture, solveAssignments
} from "@/modules/ai/infrastructure/flows";
import {
    AIResearcherInputSchema, CreateLectureUnitInputSchema, GenerateCitationInputSchema,
    LiteratureReviewInputSchema, GenerateQuizInputSchema, GenerateTheoreticalLectureInputSchema,
    SolveAssignmentsInputSchema
} from "@/modules/ai/domain/schemas";
import { ToolConfig } from "../WritingToolRegistry";

export const AcademicTools: Record<string, ToolConfig> = {
    'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema, creditCost: 3 },
    'lecture-generator': { flow: createLectureUnit, schema: CreateLectureUnitInputSchema, creditCost: 3 },
    'generate-citation': { flow: generateCitation, schema: GenerateCitationInputSchema, creditCost: 1, isFreeForGuests: true },
    'literature-review-generator': { flow: generateLiteratureReview, schema: LiteratureReviewInputSchema, creditCost: 3 },
    'generate-quiz': { flow: generateQuiz, schema: GenerateQuizInputSchema, creditCost: 2 },
    'theoretical-lecture': { flow: generateTheoreticalLecture, schema: GenerateTheoreticalLectureInputSchema, creditCost: 2 },
    'solve-assignments': { flow: solveAssignments, schema: SolveAssignmentsInputSchema, creditCost: 2 },
};

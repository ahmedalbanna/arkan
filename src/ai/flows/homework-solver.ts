
"use server";
/**
 * @fileOverview AI agents for analyzing and solving homework from images and PDF context.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";
import {
  AnalyzedHomeworkSchema,
  AnalyzedHomework,
  SolvedHomeworkSchema,
  SolvedHomework,
} from "./homework-solver.shared";

// 1. Analyze Homework Flow
const AnalyzeHomeworkInputSchema = z.object({
  homeworkImageUris: z.array(
    z
      .string()
      .describe(
        "A list of homework assignment images, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      )
  ),
  curriculumContext: z.string().describe("The context from the curriculum PDF."),
});

export async function analyzeHomework(
  input: z.infer<typeof AnalyzeHomeworkInputSchema>
): Promise<AnalyzedHomework> {
  const validation = AnalyzeHomeworkInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(
      `Invalid input for analyzeHomework: ${validation.error.message}`
    );
  }

  const analysisPrompt = ai.definePrompt({
    name: "analyzeHomeworkPrompt",
    input: { schema: AnalyzeHomeworkInputSchema },
    output: { schema: AnalyzedHomeworkSchema },
    prompt: `You are an expert academic analyst. Your task is to analyze the provided homework images and curriculum context.

    1.  **Analyze the Homework Images**: Extract all questions from all images provided.
    2.  **Identify Subject and Title**: Based on the questions and the curriculum context, determine the main subject and create a concise title for the assignment.
    3.  **Format Output**: Structure the extracted questions into a clean Markdown document.

    Homework Images:
    ---
    {{#each homeworkImageUris}}
    {{media url=this}}
    {{/each}}
    ---
    Curriculum Context:
    ---
    {{{curriculumContext}}}
    ---
    `,
  });

  const { output } = await analysisPrompt(validation.data);
  return output!;
}

// 2. Solve Homework Flow

// Define a simple web browsing tool
const webBrowserTool = ai.defineTool(
  {
    name: "webBrowser",
    description:
      "Fetches the content of a given URL. Use this to access information from web pages.",
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string(),
  },
  async ({ url }) => {
    // In a real implementation, this would fetch the URL content.
    // For this demonstration, we'll return placeholder content based on the URL.
    if (url.includes("youtube.com")) {
      return "YouTube's Intellectual Property (IP) policy states that creators must own the rights to all content they upload. YouTube provides tools like Content ID to help rights holders manage their content and provides a clear process for filing copyright takedown notices. Repeat infringers risk account termination.";
    }
    if (url.includes("udemy.com")) {
      return "Udemy's Intellectual Property policy prohibits instructors from using copyrighted material without permission. Instructors are responsible for ensuring their course content, including lectures, quizzes, and supplemental materials, is original or properly licensed. Udemy has a system for reporting and handling IP violations.";
    }
    return `Could not fetch content from URL: ${url}`;
  }
);

const SolveHomeworkInputSchema = z.object({
  analyzedHomework: AnalyzedHomeworkSchema,
  curriculumContext: z
    .string()
    .describe(
      "The structured and summarized content from the curriculum PDF, to be used as a primary source of information."
    ),
  targetLang: z
    .string()
    .default("English")
    .describe(
      "The target language for the final solution (e.g., 'Arabic', 'English')."
    ),
});

export async function solveHomework(
  input: z.infer<typeof SolveHomeworkInputSchema>
): Promise<SolvedHomework> {
  const validation = SolveHomeworkInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(
      `Invalid input for solveHomework: ${validation.error.message}`
    );
  }

  const { analyzedHomework, curriculumContext, targetLang } = validation.data;

  const solvePrompt = ai.definePrompt({
    name: "solveHomeworkPrompt",
    input: { schema: SolveHomeworkInputSchema },
    output: { schema: SolvedHomeworkSchema },
    model: "googleai/gemini-2.5-flash",
    tools: [webBrowserTool],
    prompt: `You are an expert AI assistant tasked with completing a homework assignment. Your primary goal is to directly generate the required answers based on the provided questions and context.

**CRITICAL INSTRUCTIONS:**
1.  **Execute the Task**: Do not act as a tutor or give instructions. Your task is to PERFORM the request and generate the final content.
2.  **Use Your Tools**: If a question contains a URL, you MUST use the \`webBrowserTool\` to fetch the content from that URL. Use the fetched content to formulate your answer.
3.  **Primary Context**: Use the provided "Curriculum Context" as your main source of information for solving the problems.
4.  **Language**: Generate the entire final solution in **{{{targetLang}}}**. All parts of your output must be in this language.
5.  **Output Format**: Provide the solution as an array of question/solution pairs, adhering to the specified JSON schema.

---
**Curriculum Context:**
{{{curriculumContext}}}
---
**Homework Questions (Subject: {{{analyzedHomework.subject}}}):**
{{{analyzedHomework.structuredQuestions}}}
---
`,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}

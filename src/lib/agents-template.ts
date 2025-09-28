

import { AgentCategory } from '@/lib/models/agent';
import { Agent, AgentProperties } from '@/lib/models/agent';
import { FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, Hand, DraftingCompass, Files, Presentation, DatabaseZap, History, FileHeart, LayoutGrid, Scale, Megaphone, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const diagramBasePrompt = `You are an expert systems analyst specializing in PlantUML. Your task is to generate a complete and valid PlantUML diagram based on the provided project proposal and other context.

--- PlantUML Style Guide & Instructions ---
- Use the '!theme plain' for a modern and readable look.
- Set 'skinparam linetype ortho' for clean, right-angled connectors.
- Your entire response MUST be only the PlantUML code.
- The code must start with '@startuml' and end with '@enduml'.
- Do not add any conversational text, explanations, or markdown code fences (\`\`\`) around your response.
`;


export const AGENTS: AgentProperties[] = [
  {
    id: 'summarize-project',
    name: 'Project Summarizer Agent',
    description: 'Generates a concise project summary from a detailed description, highlighting key aspects and technologies used.',
    category: AgentCategory.ContentGeneration,
    pageUrl: '/summarize',
    isEnabled: true,
    prompt: {
      base: `You are an AI assistant designed to analyze software project descriptions. Your tasks are:
1. Provide a concise summary of the project, highlighting its key aspects.
2. Identify and extract a list of all technologies, frameworks, and libraries mentioned.

Please analyze the following project description and provide the output in the required structured format.

Description: {{{projectDescription}}}`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-ui',
    name: 'UI Agent',
    description: 'Creates UI components from a text description.',
    category: AgentCategory.CodeGeneration,
    pageUrl: '/ui-agent',
    isEnabled: true,
    prompt: {
      base: `You are an expert frontend developer specializing in modern UI design. Your task is to generate the HTML and CSS for a UI component based on a user's prompt.`,
      guidelines: [
        { text: "HTML: Provide only the body content. Do not include <html>, <head>, or <body> tags. The HTML should be clean and semantic.", isDefault: true },
        { text: "CSS: Provide only the CSS styles. Do not include <style> tags. Use modern CSS practices. Make it visually appealing, responsive, and use a professional color palette. Do not use any external images or fonts.", isDefault: true }
      ]
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-proposal',
    name: 'Project Proposal Agent',
    description: 'Creates a comprehensive, professional project proposal from a single project idea, complete with timelines, budget, and risks.',
    category: AgentCategory.ProposalGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: 'You are an expert project manager and technical writer. A user will provide you with a project idea and other context. Your task is to generate a comprehensive and professional project proposal based on that information.',
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-ad-copy',
    name: 'Marketing Ad Copy Agent',
    description: 'Generates compelling ad copy for a product or service.',
    category: AgentCategory.Marketing,
    pageUrl: '/generate', // This could be a new page later
    isEnabled: true,
    prompt: {
      base: `You are a professional copywriter specializing in high-converting ad copy. A user will provide a product name and description. Your task is to generate 3 distinct ad copy variations (Headline and Body) for a social media campaign.`,
      guidelines: [
        { text: "Product Name: {{{productName}}}", isDefault: true },
        { text: "Product Description: {{{productDescription}}}", isDefault: true },
        { text: "Target Audience: {{{targetAudience}}}", isDefault: true }
      ]
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-nda',
    name: 'Legal NDA Agent',
    description: 'Generates a standard Non-Disclosure Agreement between two parties.',
    category: AgentCategory.Legal,
    pageUrl: '/generate', // This could be a new page later
    isEnabled: true,
    prompt: {
      base: `You are a legal assistant AI. Based on the user's input, generate a standard, basic Non-Disclosure Agreement (NDA).`,
      guidelines: [
        { text: "Disclosing Party: {{{disclosingParty}}}", isDefault: true },
        { text: "Receiving Party: {{{receivingParty}}}", isDefault: true },
        { text: "Effective Date: {{{effectiveDate}}}", isDefault: true },
        { text: "Generate the NDA text. IMPORTANT: Include a disclaimer that this is not legal advice and a qualified lawyer should be consulted.", isDefault: true }
      ]
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  // Report Section Agents
  {
    id: 'generate-abstract-section',
    name: 'Abstract Agent',
    description: 'Writes a concise abstract summarizing the entire training report.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an academic writer. Your task is to write a concise and informative abstract for a training report. It should summarize the purpose, methods, key experiences, and major conclusions of the training period.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-acknowledgment-section',
    name: 'Acknowledgment Agent',
    description: 'Drafts a professional acknowledgment section to thank individuals and organizations.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a professional writer. Your task is to draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-introduction-section',
    name: 'Introduction Agent',
    description: 'Writes a professional introduction for a project report based on the full proposal data.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an expert technical writer. Your task is to craft a comprehensive and professional **Introduction** for a formal report.
The introduction should include:
1. A clear **Problem Definition**.
2. The project's main **Goals and Objectives**.
3. A brief **Solution Overview**.
4. The project's **Scope and Limitations**.
5. An **Overview** of the report's structure.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-trainingProgram-section',
    name: 'Training Program Agent',
    description: 'Details the training program, including objectives, structure, and timeline.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a training coordinator. Your task is to write a detailed 'Training Program' section. Describe the structure, goals, and schedule of the training undertaken.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-technicalExperience-section',
    name: 'Technical Experience Agent',
    description: 'Describes the technical skills and knowledge gained during the training period.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a technical specialist. Your task is to write a 'Technical Experience' section detailing the practical skills, software, tools, and methodologies the trainee learned and applied.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-recommendations-section',
    name: 'Recommendations Agent',
    description: 'Provides actionable recommendations based on the training experience.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a strategic analyst. Your task is to provide a set of actionable recommendations in a 'Recommendations' section based on the training experience outlined in the report.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-references-section',
    name: 'References Agent',
    description: 'Generates a list of references or a bibliography in a consistent citation style.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an academic librarian. Your task is to generate a 'References' section, listing all sources mentioned in the report in a consistent citation style (e.g., APA).`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-appendices-section',
    name: 'Appendices Agent',
    description: 'Creates appendices for supplementary materials like code snippets, datasheets, or detailed logs.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a technical editor. Your task is to compile any supplementary materials (like code snippets or large data tables) into an 'Appendices' section.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-literatureReview-section',
    name: 'Literature Review Agent',
    description: 'Generates an academic and technical literature review section for the project report.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an academic and technical writer. Your task is to write a comprehensive 'Literature Review' section. It must cover an introduction to literature reviews, a review of academic literature, recent technological advancements, key findings, and how the current project fits into the existing research landscape.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-systemAnalysis-section',
    name: 'System Analysis Agent',
    description: 'Generates the system analysis section, including functional and non-functional requirements.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an expert systems analyst. Your task is to write a thorough **System Analysis** section. You must define the system's functional and non-functional requirements, data requirements, and conduct a stakeholder analysis.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-designStrategy-section',
    name: 'Design Strategy Agent',
    description: 'Generates the design strategy section, focusing on user experience and user interface.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a senior design strategist and UI/UX expert. Your task is to write a detailed **Design Strategy** section. You must formulate a comprehensive design approach including methodology, core principles, UX goals, UI direction, and an accessibility plan.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-systemDesign-section',
    name: 'System Design Agent',
    description: 'Generates the system design section, defining the architecture, data model, and components.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a principal software architect. Your task is to create a comprehensive **System Design** section. This includes defining the high-level architecture, data model, component breakdown, and technology stack.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-systemProgramming-section',
    name: 'System Programming Agent',
    description: 'Generates the system programming and implementation section, defining workflow and standards.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a lead software engineer. Your task is to write a 'System Programming and Implementation' section. Detail the development workflow, coding standards, key libraries, environment setup, and version control strategy.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-systemTesting-section',
    name: 'System Testing Agent',
    description: 'Generates the system testing section, defining the testing strategy, tools, and metrics.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are a senior QA engineer. Your task is to write a comprehensive 'System Testing' section. Detail the testing levels, types, overall strategy, test plan, and the tools and metrics that will be used.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-conclusion-section',
    name: 'Conclusion Agent',
    description: 'Writes a concise and impactful conclusion for the final project report.',
    category: AgentCategory.ReportGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an expert technical writer. Your task is to write a concise and impactful **Conclusion** section. You must summarize the key points, reiterate the expected outcomes, and provide a forward-looking final statement.`,
      guidelines: [],
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  // End Report Section Agents
  {
    id: 'generate-presentation',
    name: 'Presentation Agent',
    description: 'Creates a slide deck from project proposal and report content.',
    category: AgentCategory.PresentationGeneration,
    pageUrl: '/generate', // This agent is used on the project page directly
    isEnabled: true,
    prompt: {
      base: `You are an expert presentation creator. Your task is to take a project proposal, along with generated report sections and diagrams, and create a compelling presentation slide deck.

Create a logical flow for the presentation, starting with an introduction and problem statement, moving through the solution and design, and ending with a conclusion. Select the most important information to display. Keep slide content concise and focused on bullet points. Use the speaker notes to add detail and elaborate on the points.

You will be provided with the full project proposal in JSON format, and may also be provided with generated text sections or diagrams. Synthesize all this information to create the slide deck.`,
      guidelines: [
        { text: "The total number of slides should be between 7 and 12.", isDefault: true },
        { text: "Start with a Title slide that includes the project title and author.", isDefault: true },
        { text: "Each slide must have a clear title.", isDefault: true },
        { text: "Slide content should be a list of 2-5 concise bullet points.", isDefault: true },
        { text: "Speaker notes must be detailed, providing elaboration for each bullet point.", isDefault: true },
        { text: "Maintain a professional and engaging tone throughout.", isDefault: true },
      ]
    },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  // Diagram Agents
  {
    id: 'generate-useCase-diagram',
    name: 'Use Case Diagram Agent',
    description: 'Produces a PlantUML Use Case diagram to identify actors and use cases.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-class-diagram',
    name: 'Class Diagram Agent',
    description: 'Produces a PlantUML Class diagram showing classes, attributes, methods, and relationships.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-sequence-diagram',
    name: 'Sequence Diagram Agent',
    description: 'Produces a PlantUML Sequence diagram to illustrate object interactions in a specific scenario.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-activity-diagram',
    name: 'Activity Diagram Agent',
    description: 'Produces a PlantUML Activity diagram to model the workflow of system processes.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-component-diagram',
    name: 'Component Diagram Agent',
    description: 'Produces a PlantUML Component diagram depicting the system architecture in terms of components.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-archimate-diagram',
    name: 'ArchiMate Diagram Agent',
    description: 'Produces a PlantUML ArchiMate diagram to model enterprise architecture across multiple layers.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'generate-er-diagram',
    name: 'ER Diagram Agent',
    description: 'Produces a PlantUML Entity-Relationship (ER) diagram to model the database schema.',
    category: AgentCategory.DiagramGeneration,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: { base: diagramBasePrompt },
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
  {
    id: 'activity-history',
    name: 'Activity History',
    description: 'View the logs of all agent generations for administrative review.',
    category: AgentCategory.AdminTools,
    pageUrl: '/admin/manage-generations',
    isEnabled: true, // Typically for admins only, controlled by UI
    prompt: '',
    tone: 'Default',
    language: 'English (US)',
    model: 'googleai/gemini-1.5-flash',
  },
];

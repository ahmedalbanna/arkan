

import { FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Pencil, Files, LayoutGrid, Scale, Megaphone, FileJson, PencilRuler } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AgentGuideline {
  text: string;
  isDefault: boolean;
}

export interface AgentPrompt {
  base: string;
  guidelines?: AgentGuideline[];
  jsonStructure?: any;
}

export enum AgentCategory {
  ContentGeneration = 'Content Generation',
  ProposalGeneration = 'Proposal Generation',
  ReportGeneration = 'Report Generation',
  DiagramGeneration = 'Diagram Generation',
  PresentationGeneration = 'Presentation Generation',
  CodeGeneration = 'Code Generation',
  Marketing = 'Marketing',
  Legal = 'Legal',
  AdminTools = 'Admin Tools',
}

export interface AgentData {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  pageUrl: string;
  isEnabled: boolean;
  prompt: AgentPrompt | string; // Can be simple string or complex object
  toolIds?: string[];
}

export interface Agent extends AgentData {
  icon: LucideIcon;
}

const diagramBasePrompt = `You are an expert systems analyst specializing in PlantUML. Your task is to generate a complete and valid PlantUML diagram based on the provided project proposal and other context.

--- PlantUML Style Guide & Instructions ---
- Use the '!theme plain' for a modern and readable look.
- Set 'skinparam linetype ortho' for clean, right-angled connectors.
- Your entire response MUST be only the PlantUML code.
- The code must start with '@startuml' and end with '@enduml'.
- Do not add any conversational text, explanations, or markdown code fences (\`\`\`) around your response.

--- Diagram-Specific Task ---
Based on the guidelines below, generate the requested PlantUML diagram.

--- Context from Project ---
You will be provided with the full project proposal in JSON format, as well as any previously generated text sections or diagrams. Use this context to ensure the diagram is accurate and consistent with the overall project.
`;


export const AGENTS: Agent[] = [
  {
    id: 'summarize-project',
    name: 'Project Summarizer Agent',
    description: 'Generates a concise project summary from a detailed description, highlighting key aspects and technologies used.',
    category: AgentCategory.ContentGeneration,
    icon: BrainCircuit,
    pageUrl: '/summarize',
    isEnabled: true,
    prompt: `You are an AI assistant designed to analyze software project descriptions. Your tasks are:
1. Provide a concise summary of the project, highlighting its key aspects.
2. Identify and extract a list of all technologies, frameworks, and libraries mentioned.

Please analyze the following project description and provide the output in the required structured format.

Description: {{{projectDescription}}}`
  },
   {
    id: 'generate-ui',
    name: 'UI Agent',
    description: 'Creates UI components from a text description.',
    category: AgentCategory.CodeGeneration,
    icon: LayoutGrid,
    pageUrl: '/ui-agent',
    isEnabled: true,
    prompt: `You are an expert frontend developer specializing in modern UI design. Your task is to generate the HTML and CSS for a UI component based on a user's prompt.

Guidelines:
1.  **HTML**: Provide only the body content. Do not include <html>, <head>, or <body> tags. The HTML should be clean and semantic.
2.  **CSS**: Provide only the CSS styles. Do not include <style> tags. Use modern CSS practices. Make it visually appealing, responsive, and use a professional color palette. Do not use any external images or fonts.

User Prompt: {{{prompt}}}
`,
  },
  {
    id: 'generate-proposal',
    name: 'Project Proposal Agent',
    description: 'Creates a comprehensive, professional project proposal from a single project idea, complete with timelines, budget, and risks.',
    category: AgentCategory.ProposalGeneration,
    icon: FileText,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date. Also, provide a list of 3 to 5 relevant tags for the project based on its content.

IMPORTANT: For all fields that contain descriptive text (like 'objective', 'methodology', 'evaluation', 'interest', 'description', and 'mitigation'), you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.

Project Idea: {{{projectIdea}}}`,
        guidelines: []
    }
  },
   {
    id: 'generate-ad-copy',
    name: 'Marketing Ad Copy Agent',
    description: 'Generates compelling ad copy for a product or service.',
    category: AgentCategory.Marketing,
    icon: Megaphone,
    pageUrl: '/generate', // This could be a new page later
    isEnabled: true,
    prompt: `You are a professional copywriter specializing in high-converting ad copy. A user will provide a product name and description. Your task is to generate 3 distinct ad copy variations (Headline and Body) for a social media campaign.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Target Audience: {{{targetAudience}}}`
  },
  {
    id: 'generate-nda',
    name: 'Legal NDA Agent',
    description: 'Generates a standard Non-Disclosure Agreement between two parties.',
    category: AgentCategory.Legal,
    icon: Scale,
    pageUrl: '/generate', // This could be a new page later
    isEnabled: true,
    prompt: `You are a legal assistant AI. Based on the user's input, generate a standard, basic Non-Disclosure Agreement (NDA).
Disclosing Party: {{{disclosingParty}}}
Receiving Party: {{{receivingParty}}}
Effective Date: {{{effectiveDate}}}

Generate the NDA text. IMPORTANT: Include a disclaimer that this is not legal advice and a qualified lawyer should be consulted.`
  },
  // Report Section Agents
  {
    id: 'generate-abstract-section',
    name: 'Abstract Agent',
    description: 'Writes a concise abstract summarizing the entire training report.',
    category: AgentCategory.ReportGeneration,
    icon: FileText,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an academic writer. Based on the provided context, write a concise and informative abstract for a training report. The abstract should summarize the purpose, methods, key experiences, and major conclusions of the training period.`,
        guidelines: [
            { text: "Keep the abstract to a single paragraph and under 250 words.", isDefault: true },
            { text: "Clearly state the main objectives of the training.", isDefault: true },
            { text: "Briefly mention the key areas of the training program and technical skills acquired.", isDefault: true },
            { text: "Conclude with the most significant outcomes and recommendations.", isDefault: true },
        ]
    }
  },
   {
    id: 'generate-acknowledgment-section',
    name: 'Acknowledgment Agent',
    description: 'Drafts a professional acknowledgment section to thank individuals and organizations.',
    category: AgentCategory.ReportGeneration,
    icon: FileHeart,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a professional writer. Based on the provided context, draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.`,
        guidelines: [
            { text: "Maintain a formal and appreciative tone.", isDefault: true },
            { text: "Mention specific roles like supervisors, team members, or company departments if context is available.", isDefault: true },
            { text: "Acknowledge the training institution or company by name.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-introduction-section',
    name: 'Introduction Agent',
    description: 'Writes a professional introduction for a project report based on the full proposal data.',
    category: AgentCategory.ReportGeneration,
    icon: BookMarked,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
      base: `You are an expert technical writer specializing in project proposals. Based on the provided project proposal and any additional context, write a complete and professional introduction section for the formal report.
Synthesize the information from the entire proposal and the provided context to create this introduction. Infer the problem from the objective and risks. Infer the limitations of existing systems from the project's goals.
Generate the entire introduction as a single, coherent text. Use markdown newlines for paragraph breaks.

The introduction should be well-structured, engaging, and must include:`,
      guidelines: [
        { text: "**Purpose of the Project**: A clear statement of why the project is being undertaken.", isDefault: true },
        { text: "**Problem Definition**: A detailed identification and explanation of the problem the project addresses.", isDefault: true },
        { text: "**Overview of the Document**: An outline of the report structure, mentioning the main sections.", isDefault: true },
        { text: "**Existing Systems or Technologies**: A description of current solutions and their limitations, justifying the need for this new project.", isDefault: true },
      ]
    }
  },
  {
    id: 'generate-trainingProgram-section',
    name: 'Training Program Agent',
    description: 'Details the training program, including objectives, structure, and timeline.',
    category: AgentCategory.ReportGeneration,
    icon: Library,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a training coordinator. Based on the context provided, write a detailed 'Training Program' section. Describe the structure, goals, and schedule of the training undertaken.`,
        guidelines: [
            { text: "Outline the main objectives of the training program.", isDefault: true },
            { text: "Describe the weekly or monthly schedule of activities and learning modules.", isDefault: true },
            { text: "List the key departments or areas covered during the training.", isDefault: true },
            { text: "Use a table to present the training timeline clearly.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-technicalExperience-section',
    name: 'Technical Experience Agent',
    description: 'Describes the technical skills and knowledge gained during the training period.',
    category: AgentCategory.ReportGeneration,
    icon: TestTube2,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a technical specialist. Based on the provided context, write a 'Technical Experience' section. Detail the practical skills, software, tools, and methodologies the trainee learned and applied.`,
        guidelines: [
            { text: "List specific software, programming languages, or tools used.", isDefault: true },
            { text: "Describe the tasks and projects the trainee worked on.", isDefault: true },
            { text: "Explain how theoretical knowledge was applied to practical problems.", isDefault: true },
            { text: "Use a dedicated subsection for each major skill or project area.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-recommendations-section',
    name: 'Recommendations Agent',
    description: 'Provides actionable recommendations based on the training experience.',
    category: AgentCategory.ReportGeneration,
    icon: Hand,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a strategic analyst. Based on the training experience outlined in the report, provide a set of actionable recommendations in a 'Recommendations' section. These could be for the company, the training program, or future trainees.`,
        guidelines: [
            { text: "Structure the recommendations as a numbered or bulleted list.", isDefault: true },
            { text: "Ensure each recommendation is specific, measurable, and relevant.", isDefault: true },
            { text: "Provide a brief justification for each recommendation based on the experiences described in the report.", isDefault: true },
        ]
    }
  },
   {
    id: 'generate-references-section',
    name: 'References Agent',
    description: 'Generates a list of references or a bibliography in a consistent citation style.',
    category: AgentCategory.ReportGeneration,
    icon: DraftingCompass,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an academic librarian. Based on the context provided throughout the report, generate a 'References' section. List all the books, articles, websites, or other sources mentioned or implied in the text.`,
        guidelines: [
            { text: "Format all citations consistently using a standard style (e.g., APA, MLA).", isDefault: true },
            { text: "Ensure the list is alphabetically sorted.", isDefault: true },
            { text: "If no specific sources are mentioned, create a plausible list of 5-7 relevant, fictional sources that fit the report's topic.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-appendices-section',
    name: 'Appendices Agent',
    description: 'Creates appendices for supplementary materials like code snippets, datasheets, or detailed logs.',
    category: AgentCategory.ReportGeneration,
    icon: Files,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a technical editor. Compile any supplementary materials mentioned in the report into an 'Appendices' section. This may include code snippets, large data tables, or other detailed information that supports the main body of the report.`,
        guidelines: [
            { text: "Label each appendix clearly (e.g., 'Appendix A: Source Code for Module X').", isDefault: true },
            { text: "Use markdown code blocks for any source code.", isDefault: true },
            { text: "Use markdown tables for large datasets.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-literatureReview-section',
    name: 'Literature Review Agent',
    description: 'Generates an academic and technical literature review section for the project report.',
    category: AgentCategory.ReportGeneration,
    icon: Library,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an academic and technical writer. Based on the provided project proposal and any additional context, write a comprehensive 'Literature Review' section for the final report.
Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review. Use markdown for formatting.

Your review should:`,
        guidelines: [
            { text: "Discuss existing research, established theories, and relevant studies in the project's domain.", isDefault: true },
            { text: "Analyze current technologies, frameworks, and methodologies that are pertinent to the project's objective.", isDefault: true },
            { text: "Identify the gaps in the existing literature or technology that this project aims to address.", isDefault: true },
            { text: "Provide a strong justification for the project by positioning it within the context of current knowledge and practices.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-systemAnalysis-section',
    name: 'System Analysis Agent',
    description: 'Generates the system analysis section, including functional and non-functional requirements.',
    category: AgentCategory.ReportGeneration,
    icon: Waypoints,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an expert systems analyst. Based on the provided project proposal and any additional context, write a thorough 'System Analysis' section.
Synthesize information from the entire proposal and the provided context to create a comprehensive analysis. Use markdown for formatting, including bullet points for requirements.

Your analysis must cover:`,
        guidelines: [
            { text: "**Functional Requirements**: Detail the specific functions the system must perform. Infer these from the project objective, expected outcomes, and stakeholders' interests.", isDefault: true },
            { text: "**Non-Functional Requirements**: Describe the system's quality attributes, such as performance, security, usability, and scalability. Infer these from the project's context and risks.", isDefault: true },
            { text: "**Stakeholder Analysis**: Elaborate on the needs and expectations of each stakeholder group identified in the proposal.", isDefault: true },
            { text: "**Problem Analysis**: Expand on the limitations of current systems (as suggested by the project's rationale) and clearly define the scope of the problem being solved.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-designStrategy-section',
    name: 'Design Strategy Agent',
    description: 'Generates the design strategy section, focusing on user experience and user interface.',
    category: AgentCategory.ReportGeneration,
    icon: BookText,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a senior design strategist and UI/UX expert. Based on the provided project proposal and any additional context, write a detailed 'Design Strategy' section.
Synthesize information from the entire proposal and the provided context to create a coherent design strategy. Use markdown for formatting.

This section should articulate:`,
        guidelines: [
            { text: "**Design Methodology**: Justify the choice of design approach (e.g., User-Centered Design, Double Diamond, etc.) based on the project's methodology and objectives.", isDefault: true },
            { text: "**Core Design Principles**: Define 3-5 key principles that will guide the design process (e.g., 'Clarity and Simplicity', 'Efficiency', 'Consistency').", isDefault: true },
            { text: "**User Experience (UX) Goals**: Describe the intended user experience, focusing on how the design will address stakeholder needs and solve the core problem.", isDefault: true },
            { text: "**User Interface (UI) Direction**: Outline the visual direction, including thoughts on layout, color palette, and typography that would align with the project's category and goals.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-systemDesign-section',
    name: 'System Design Agent',
    description: 'Generates the system design section, defining the architecture, data model, and components.',
    category: AgentCategory.ReportGeneration,
    icon: Code,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a principal software architect. From the provided project proposal and any additional context, create a comprehensive 'System Design' section.
Synthesize information from the entire proposal and the provided context to produce a logical and robust system design. Use markdown for formatting.

This section must detail:`,
        guidelines: [
            { text: "**High-Level Architecture**: Describe and justify the chosen architectural pattern (e.g., Monolithic, Microservices, Serverless). Base the choice on the project's scale, objectives, and risks.", isDefault: true },
            { text: "**Data Model / Schema**: Outline the key data entities, their attributes, and relationships. Think about users, primary objects, and configurations.", isDefault: true },
            { text: "**Component Breakdown**: Describe the major components of the system (e.g., Authentication Service, API Gateway, Frontend Application, Database) and their responsibilities.", isDefault: true },
            { text: "**Technology Stack**: Propose a specific and justified technology stack for the backend, frontend, database, and deployment based on the project's requirements.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-systemProgramming-section',
    name: 'System Programming Agent',
    description: 'Generates the system programming and implementation section, defining workflow and standards.',
    category: AgentCategory.ReportGeneration,
    icon: Code,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a lead software engineer. Based on the provided project proposal and any additional context, write a 'System Programming and Implementation' section for the technical report.
Synthesize information from the entire proposal and the provided context to create a practical implementation plan. Use markdown for formatting.

This section should outline:`,
        guidelines: [
            { text: "**Development Workflow**: Describe the development process, aligning with the project's stated methodology (e.g., Git flow for Agile).", isDefault: true },
            { text: "**Coding Standards & Practices**: Mention key standards to be followed (e.g., code style guides, linting rules, commenting conventions).", isDefault: true },
            { text: "**Key Libraries & Frameworks**: Based on the project type, list the essential libraries and frameworks that will be used for implementation and justify their selection.", isDefault: true },
            { text: "**Environment Setup**: Briefly describe the development, staging, and production environments.", isDefault: true },
            { text: "**Version Control**: Specify the version control system (e.g., Git) and hosting platform (e.g., GitHub, GitLab).", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-systemTesting-section',
    name: 'System Testing Agent',
    description: 'Generates the system testing section, defining the testing strategy, tools, and metrics.',
    category: AgentCategory.ReportGeneration,
    icon: TestTube2,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are a senior QA engineer. Using the provided project proposal and any additional context, write a comprehensive 'System Testing' section.
Synthesize information from the entire proposal, especially the risks and success criteria, to create a robust testing plan. Use markdown for formatting.

This section must define the testing strategy, including:`,
        guidelines: [
            { text: "**Testing Levels**: Describe the plan for Unit Testing, Integration Testing, System Testing, and User Acceptance Testing (UAT).", isDefault: true },
            { text: "**Testing Types**: Detail the approach for functional testing, usability testing, performance testing, and security testing.", isDefault: true },
            { text: "**Tools and Automation**: Recommend specific tools for test automation (e.g., Selenium, Cypress, Jest), performance testing (e.g., JMeter), and bug tracking (e.g., Jira).", isDefault: true },
            { text: "**Test Metrics**: Identify key metrics for success, such as test coverage, bug detection rate, and UAT pass rate, linking them to the project's success criteria.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-conclusion-section',
    name: 'Conclusion Agent',
    description: 'Writes a concise and impactful conclusion for the final project report.',
    category: AgentCategory.ReportGeneration,
    icon: Flag,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: `You are an expert technical writer. Based on the provided project proposal and any additional context, write a concise and impactful 'Conclusion' section for the final report.
Synthesize information from the entire proposal and the provided context to create a powerful conclusion. Use markdown for formatting.

The conclusion should:`,
        guidelines: [
            { text: "**Summarize Key Points**: Briefly reiterate the problem, the proposed solution, and the project's main objective.", isDefault: true },
            { text: "**Reiterate Expected Outcomes**: Restate the most important expected outcomes and the value the project will deliver.", isDefault: true },
            { text: "**Future Outlook**: Provide a forward-looking statement about the project's potential long-term impact or next steps after completion.", isDefault: true },
            { text: "**Final Statement**: End with a strong, conclusive statement that reinforces the project's importance and viability.", isDefault: true },
        ]
    }
  },
  // End Report Section Agents
  {
    id: 'generate-presentation',
    name: 'Presentation Agent',
    description: 'Creates a slide deck from project proposal and report content.',
    category: AgentCategory.PresentationGeneration,
    icon: Presentation,
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
    }
  },
  // Diagram Agents
  {
    id: 'generate-use-case-diagram',
    name: 'Use Case Diagram Agent',
    description: 'Produces a PlantUML Use Case diagram to identify actors and use cases.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Identify the primary actors from the 'stakeholders' section of the proposal (e.g., 'Primary User', 'Sponsor').", isDefault: true },
            { text: "Define use cases based on the 'objective', 'expected_outcome', and any available functional requirements.", isDefault: true },
            { text: "Connect actors to their relevant use cases to show interactions.", isDefault: true },
            { text: "Use rectangles to group related use cases within a system boundary.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-class-diagram',
    name: 'Class Diagram Agent',
    description: 'Produces a PlantUML Class diagram showing classes, attributes, methods, and relationships.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Identify key classes (entities) from the project's 'objective' and 'System Design' section if available.", isDefault: true },
            { text: "For each class, define relevant attributes (fields) and methods (operations).", isDefault: true },
            { text: "Establish relationships (associations, aggregations, inheritance) between the classes with clear cardinality (e.g., '1' -- '*' 'many').", isDefault: true },
            { text: "Use visibility markers (+ for public, - for private, # for protected) for attributes and methods.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-sequence-diagram',
    name: 'Sequence Diagram Agent',
    description: 'Produces a PlantUML Sequence diagram to illustrate object interactions in a specific scenario.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Identify participants (actors and system components/classes). Refer to the Use Case and Class diagrams if available.", isDefault: true },
            { text: "Illustrate the step-by-step interactions for a primary workflow (e.g., 'User logs in', 'User creates a project').", isDefault: true },
            { text: "Clearly show the order of messages exchanged between participants using arrows.", isDefault: true },
            { text: "Use activation boxes to represent processing time for each participant.", isDefault: true },
            { text: "Include at least one 'alt/else' block to show a conditional flow.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-activity-diagram',
    name: 'Activity Diagram Agent',
    description: 'Produces a PlantUML Activity diagram to model the workflow of system processes.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Define a clear start and end point for the process being modeled.", isDefault: true },
            { text: "Detail the sequence of activities based on a primary workflow from the 'objective' or 'methodology'.", isDefault: true },
            { text: "Incorporate at least one decision point (conditional logic) with 'if/then/else' structures.", isDefault: true },
            { text: "Use partitions (swimlanes) to assign activities to different actors or system components.", isDefault: false },
            { text: "Include forks and joins if there are parallel activities that can occur simultaneously.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-component-diagram',
    name: 'Component Diagram Agent',
    description: 'Produces a PlantUML Component diagram depicting the system architecture in terms of components.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Identify the main software components from the 'System Design' section (e.g., 'Frontend App', 'API Gateway', 'User Service').", isDefault: true },
            { text: "Show the primary dependencies between these components using relationship arrows.", isDefault: true },
            { text: "For at least one component, define a provided interface that other components use.", isDefault: true },
            { text: "Group related components into a package if the architecture is complex.", isDefault: false },
        ]
    }
  },
  {
    id: 'generate-archimate-diagram',
    name: 'ArchiMate Diagram Agent',
    description: 'Produces a PlantUML ArchiMate diagram to model enterprise architecture across multiple layers.',
    category: AgentCategory.DiagramGeneration,
    icon: GitGraph,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Focus on the Business and Application layers.", isDefault: true },
            { text: "Identify Business Actors and Roles from the 'stakeholders' section.", isDefault: true },
            { text: "Define Business Functions or Processes based on the project's 'objective'.", isDefault: true },
            { text: "Identify Application Components that realize the business processes, as described in 'System Design'.", isDefault: true },
            { text: "Use proper ArchiMate relationships (e.g., assignment, realization, serving) to connect the elements.", isDefault: true },
        ]
    }
  },
  {
    id: 'generate-er-diagram',
    name: 'ER Diagram Agent',
    description: 'Produces a PlantUML Entity-Relationship (ER) diagram to model the database schema.',
    category: AgentCategory.DiagramGeneration,
    icon: DatabaseZap,
    pageUrl: '/generate',
    isEnabled: true,
    prompt: {
        base: diagramBasePrompt,
        guidelines: [
            { text: "Identify key entities from the 'System Design' section's data model or from the project's main nouns (e.g., User, Project, Comment).", isDefault: true },
            { text: "For each entity, define attributes. Clearly mark the Primary Key (PK) and any Foreign Keys (FK).", isDefault: true },
            { text: "Establish relationships between entities using standard ERD notation (e.g., one-to-one, one-to-many, many-to-many).", isDefault: true },
            { text: "Use PlantUML's ER diagram syntax (e.g., `entity \"Name\" { ... }`, `User }o--|| Project`).", isDefault: true },
        ]
    }
  },
  {
    id: 'activity-history',
    name: 'Activity History',
    description: 'View the logs of all agent generations for administrative review.',
    category: AgentCategory.AdminTools,
    icon: History,
    pageUrl: '/admin/manage-generations',
    isEnabled: true, // Typically for admins only, controlled by UI
    prompt: ''
  },
];

    

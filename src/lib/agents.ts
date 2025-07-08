import { FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AgentData {
  id: string;
  name: string;
  description: string;
  category: 'Content Generation' | 'Report & Diagram Generation';
  pageUrl: string;
  isEnabled: boolean;
  prompt: string;
}

export interface Agent extends AgentData {
  icon: LucideIcon;
}

const createDiagramPrompt = (diagramType: string, specificInstructions: string): string => `
You are an expert systems analyst specializing in PlantUML. Your task is to generate a complete and valid PlantUML diagram based on the provided project proposal and other context.

--- PlantUML Style Guide & Instructions ---
- Use the '!theme spacelab' for a modern and readable look.
- Set 'skinparam linetype ortho' for clean, right-angled connectors.
- Your entire response MUST be only the PlantUML code.
- The code must start with '@startuml' and end with '@enduml'.
- Do not add any conversational text, explanations, or markdown code fences (\`\`\`) around your response.

--- Diagram-Specific Task ---
Generate a PlantUML **${diagramType} Diagram**.
${specificInstructions}

--- Context from Project ---
You will be provided with the full project proposal in JSON format, as well as any previously generated text sections or diagrams. Use this context to ensure the diagram is accurate and consistent with the overall project.
`;

export const AGENTS: Agent[] = [
  {
    id: 'summarize-project',
    name: 'Project Summarizer Agent',
    description: 'Generates a concise project summary from a detailed description, highlighting key aspects and technologies used.',
    category: 'Content Generation',
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
    id: 'generate-proposal',
    name: 'Project Proposal Agent',
    description: 'Creates a comprehensive, professional project proposal from a single project idea, complete with timelines, budget, and risks.',
    category: 'Content Generation',
    icon: FileText,
    pageUrl: '/generate-report', // Changed from /generate-proposal
    isEnabled: true,
    prompt: `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date. Also, provide a list of 3 to 5 relevant tags for the project based on its content.

Project Idea: {{{projectIdea}}}`
  },
  // Report Section Agents
  {
    id: 'generate-introduction',
    name: 'Introduction Agent',
    description: 'Writes a professional introduction for a project report based on the full proposal data.',
    category: 'Report & Diagram Generation',
    icon: BookMarked,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are an expert technical writer specializing in project proposals. Based on the provided project proposal and any additional context, write a complete and professional introduction section for the formal report.

The introduction should be well-structured and engaging, and must include:
1.  **Purpose of the Project**: A clear statement of why the project is being undertaken.
2.  **Problem Definition**: A detailed identification and explanation of the problem the project addresses.
3.  **Overview of the Document**: An outline of the report structure, mentioning the main sections.
4.  **Existing Systems or Technologies**: A description of current solutions and their limitations, justifying the need for this new project.

Synthesize the information from the entire proposal and the provided context to create this introduction. Infer the problem from the objective and risks. Infer the limitations of existing systems from the project's goals.
Generate the entire introduction as a single, coherent text. Use markdown newlines for paragraph breaks.`
  },
  {
    id: 'generate-literature-review',
    name: 'Literature Review Agent',
    description: 'Generates an academic and technical literature review section for the project report.',
    category: 'Report & Diagram Generation',
    icon: Library,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are an academic and technical writer. Based on the provided project proposal and any additional context, write a comprehensive 'Literature Review' section for the final report.

Your review should:
1.  Discuss existing research, established theories, and relevant studies in the project's domain.
2.  Analyze current technologies, frameworks, and methodologies that are pertinent to the project's objective.
3.  Identify the gaps in the existing literature or technology that this project aims to address.
4.  Provide a strong justification for the project by positioning it within the context of current knowledge and practices.

Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review. Use markdown for formatting.`
  },
  {
    id: 'generate-system-analysis',
    name: 'System Analysis Agent',
    description: 'Generates the system analysis section, including functional and non-functional requirements.',
    category: 'Report & Diagram Generation',
    icon: Waypoints,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are an expert systems analyst. Based on the provided project proposal and any additional context, write a thorough 'System Analysis' section.

Your analysis must cover:
1.  **Functional Requirements**: Detail the specific functions the system must perform. Infer these from the project objective, expected outcomes, and stakeholders' interests.
2.  **Non-Functional Requirements**: Describe the system's quality attributes, such as performance, security, usability, and scalability. Infer these from the project's context and risks.
3.  **Stakeholder Analysis**: Elaborate on the needs and expectations of each stakeholder group identified in the proposal.
4.  **Problem Analysis**: Expand on the limitations of current systems (as suggested by the project's rationale) and clearly define the scope of the problem being solved.

Synthesize information from the entire proposal and the provided context to create a comprehensive analysis. Use markdown for formatting, including bullet points for requirements.`
  },
  {
    id: 'generate-design-strategy',
    name: 'Design Strategy Agent',
    description: 'Generates the design strategy section, focusing on user experience and user interface.',
    category: 'Report & Diagram Generation',
    icon: BookText,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are a senior design strategist and UI/UX expert. Based on the provided project proposal and any additional context, write a detailed 'Design Strategy' section.

This section should articulate:
1.  **Design Methodology**: Justify the choice of design approach (e.g., User-Centered Design, Double Diamond, etc.) based on the project's methodology and objectives.
2.  **Core Design Principles**: Define 3-5 key principles that will guide the design process (e.g., 'Clarity and Simplicity', 'Efficiency', 'Consistency').
3.  **User Experience (UX) Goals**: Describe the intended user experience, focusing on how the design will address stakeholder needs and solve the core problem.
4.  **User Interface (UI) Direction**: Outline the visual direction, including thoughts on layout, color palette, and typography that would align with the project's category and goals.

Synthesize information from the entire proposal and the provided context to create a coherent design strategy. Use markdown for formatting.`
  },
  {
    id: 'generate-system-design',
    name: 'System Design Agent',
    description: 'Generates the system design section, defining the architecture, data model, and components.',
    category: 'Report & Diagram Generation',
    icon: Code,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are a principal software architect. From the provided project proposal and any additional context, create a comprehensive 'System Design' section.

This section must detail:
1.  **High-Level Architecture**: Describe and justify the chosen architectural pattern (e.g., Monolithic, Microservices, Serverless). Base the choice on the project's scale, objectives, and risks.
2.  **Data Model / Schema**: Outline the key data entities, their attributes, and relationships. Think about users, primary objects, and configurations.
3.  **Component Breakdown**: Describe the major components of the system (e.g., Authentication Service, API Gateway, Frontend Application, Database) and their responsibilities.
4.  **Technology Stack**: Propose a specific and justified technology stack for the backend, frontend, database, and deployment based on the project's requirements.

Synthesize information from the entire proposal and the provided context to produce a logical and robust system design. Use markdown for formatting.`
  },
   {
    id: 'generate-system-programming',
    name: 'System Programming Agent',
    description: 'Generates the system programming and implementation section, defining workflow and standards.',
    category: 'Report & Diagram Generation',
    icon: Code,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are a lead software engineer. Based on the provided project proposal and any additional context, write a 'System Programming and Implementation' section for the technical report.

This section should outline:
1.  **Development Workflow**: Describe the development process, aligning with the project's stated methodology (e.g., Git flow for Agile).
2.  **Coding Standards & Practices**: Mention key standards to be followed (e.g., code style guides, linting rules, commenting conventions).
3.  **Key Libraries & Frameworks**: Based on the project type, list the essential libraries and frameworks that will be used for implementation and justify their selection.
4.  **Environment Setup**: Briefly describe the development, staging, and production environments.
5.  **Version Control**: Specify the version control system (e.g., Git) and hosting platform (e.g., GitHub, GitLab).

Synthesize information from the entire proposal and the provided context to create a practical implementation plan. Use markdown for formatting.`
  },
   {
    id: 'generate-system-testing',
    name: 'System Testing Agent',
    description: 'Generates the system testing section, defining the testing strategy, tools, and metrics.',
    category: 'Report & Diagram Generation',
    icon: TestTube2,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are a senior QA engineer. Using the provided project proposal and any additional context, write a comprehensive 'System Testing' section.

This section must define the testing strategy, including:
1.  **Testing Levels**: Describe the plan for Unit Testing, Integration Testing, System Testing, and User Acceptance Testing (UAT).
2.  **Testing Types**: Detail the approach for functional testing, usability testing, performance testing, and security testing.
3.  **Tools and Automation**: Recommend specific tools for test automation (e.g., Selenium, Cypress, Jest), performance testing (e.g., JMeter), and bug tracking (e.g., Jira).
4.  **Test Metrics**: Identify key metrics for success, such as test coverage, bug detection rate, and UAT pass rate, linking them to the project's success criteria.

Synthesize information from the entire proposal, especially the risks and success criteria, to create a robust testing plan. Use markdown for formatting.`
  },
  {
    id: 'generate-conclusion',
    name: 'Conclusion Agent',
    description: 'Writes a concise and impactful conclusion for the final project report.',
    category: 'Report & Diagram Generation',
    icon: Flag,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: `You are an expert technical writer. Based on the provided project proposal and any additional context, write a concise and impactful 'Conclusion' section for the final report.

The conclusion should:
1.  **Summarize Key Points**: Briefly reiterate the problem, the proposed solution, and the project's main objective.
2.  **Reiterate Expected Outcomes**: Restate the most important expected outcomes and the value the project will deliver.
3.  **Future Outlook**: Provide a forward-looking statement about the project's potential long-term impact or next steps after completion.
4.  **Final Statement**: End with a strong, conclusive statement that reinforces the project's importance and viability.

Synthesize information from the entire proposal and the provided context to create a powerful conclusion. Use markdown for formatting.`
  },
  // Diagram Agents
  {
    id: 'generate-use-case-diagram',
    name: 'Use Case Diagram Agent',
    description: 'Produces a PlantUML Use Case diagram to identify actors and use cases.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('Use Case', `The diagram should:
1.  Identify the primary actors from the 'stakeholders' section (e.g., 'Primary User', 'Sponsor').
2.  Define use cases based on the 'objective', 'expected_outcome', and 'functional requirements' (which you can infer from the objectives and system analysis section if provided).
3.  Connect actors to their relevant use cases.`)
  },
  {
    id: 'generate-class-diagram',
    name: 'Class Diagram Agent',
    description: 'Produces a PlantUML Class diagram showing classes, attributes, methods, and relationships.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('Class', `The diagram should:
1.  Identify key classes (entities) from the project's 'objective', 'expected_outcome', and especially the 'System Design' section.
2.  Define attributes and methods (operations) for each class.
3.  Establish relationships (associations, aggregations, inheritance) between the classes.`)
  },
    {
    id: 'generate-sequence-diagram',
    name: 'Sequence Diagram Agent',
    description: 'Produces a PlantUML Sequence diagram to illustrate object interactions in a specific scenario.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('Sequence', `The diagram should:
1.  Identify participants (actors and system components/classes). Use the Class Diagram (if provided) for participants and the Use Case diagram for the scenario.
2.  Illustrate the step-by-step interactions between these participants for a primary use case (e.g., 'User logs in', 'User creates a project').
3.  Show the order of messages exchanged between participants.
4.  Use activation boxes to represent processing time.`)
  },
    {
    id: 'generate-activity-diagram',
    name: 'Activity Diagram Agent',
    description: 'Produces a PlantUML Activity diagram to model the workflow of system processes.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('Activity', `The diagram should:
1.  Define a start and end point for the process.
2.  Detail the sequence of activities based on a primary workflow described in the 'objective' or 'methodology'.
3.  Incorporate decision points (conditionals) and forks/joins (parallel activities) where appropriate.
4.  Optionally use partitions (swimlanes) to assign activities to different actors or system components.`)
  },
  {
    id: 'generate-component-diagram',
    name: 'Component Diagram Agent',
    description: 'Produces a PlantUML Component diagram depicting the system architecture in terms of components.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('Component', `The diagram should:
1.  Identify the main software components of the system (e.g., 'Frontend App', 'API Gateway', 'User Service', 'Database'), referencing the 'System Design' section if available.
2.  Show the interfaces provided and required by the components.
3.  Illustrate the dependencies and relationships between these components.`)
  },
  {
    id: 'generate-archimate-diagram',
    name: 'ArchiMate Diagram Agent',
    description: 'Produces a PlantUML ArchiMate diagram to model enterprise architecture across multiple layers.',
    category: 'Report & Diagram Generation',
    icon: GitGraph,
    pageUrl: '/generate-report',
    isEnabled: true,
    prompt: createDiagramPrompt('ArchiMate', `The diagram should focus on the Business Layer and Application Layer. It should:
1.  **Business Layer**: Identify Business Actors (from stakeholders), Business Roles, and Business Functions/Processes (from objectives).
2.  **Application Layer**: Identify Application Components (e.g., CRM System, Billing Service) and Application Functions that realize the business processes.
3.  **Relationships**: Show how business actors interact with business functions, and how application components support those business functions. Use proper ArchiMate relationships (e.g., assignment, realization, serving).
4.  Ensure you use ArchiMate syntax (e.g., 'archimate "Business Actor" as BA').`)
  },
];

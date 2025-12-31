

import { defaultControls, ReportTemplateProperties } from '@/lib/models';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        content: [
            {
                title: 'Front Matter',
                sections: [
                    {
                        title: 'Abstract',
                        type: 'report',
                        prompt: "Based on the provided context, write a concise and informative abstract for a training report. The abstract should summarize the purpose, methods, key experiences, and major conclusions of the training period.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ["Keep the abstract to a single paragraph and under 250 words.", "Clearly state the main objectives of the training.", "Briefly mention the key areas of the training program and technical skills acquired.", "Conclude with the most significant outcomes and recommendations."],
                        controls: { ...defaultControls, formality: 80, tone: 'academic' },
                    },
                    {
                        title: 'Acknowledgment',
                        type: 'report',
                        prompt: "Based on the provided context, draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.",
                        behaviors: [{ name: 'professional writer', type: 'persona' }],
                        guidelines: ["Maintain a formal and appreciative tone.", "Mention specific roles like supervisors, team members, or company departments if context is available.", "Acknowledge the training institution or company by name."],
                        controls: { ...defaultControls, formality: 90, tone: 'formal' },
                    }
                ]
            },
            {
                title: 'Main Body',
                sections: [
                    {
                        title: 'Introduction',
                        type: 'report',
                        prompt: "Based on the provided context, write a complete and professional introduction section for a formal report. Synthesize information to create a coherent and engaging introduction.",
                        behaviors: [{ name: 'expert technical writer specializing in project proposals', type: 'persona' }],
                        guidelines: ["Clearly state the purpose of the project.", "Define the problem the project addresses.", "Outline the report structure."],
                        controls: { ...defaultControls, formality: 75, complexity: 60, tone: 'professional', wordCount: "300" },
                    },
                    {
                        title: 'Literature Review',
                        type: 'report',
                        prompt: "Write a comprehensive 'Literature Review' section for the final report. Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review.",
                        behaviors: [{ name: 'academic and technical writer', type: 'persona' }],
                        guidelines: ["Review and analyze academic literature.", "Describe relevant technological advancements.", "Identify key findings, trends, and research gaps."],
                        controls: { ...defaultControls, formality: 90, complexity: 80, tone: 'academic', wordCount: "1000" },
                    },
                    {
                        title: 'System Analysis',
                        type: 'report',
                        prompt: "Write a thorough 'System Analysis' section, detailing functional and non-functional requirements.",
                        behaviors: [{ name: 'expert systems analyst', type: 'persona' }],
                        guidelines: ["Detail functional and data requirements.", "Describe non-functional requirements (performance, security, usability).", "Analyze stakeholder needs and problem scope."],
                        controls: { ...defaultControls, formality: 70, complexity: 75, tone: 'technical' },
                    },
                    {
                        title: 'System Design',
                        type: 'report',
                        prompt: "Create a comprehensive 'System Design' section, including architecture, data models, and technology stack.",
                        behaviors: [{ name: 'principal software architect', type: 'persona' }],
                        guidelines: ["Describe the high-level architecture.", "Outline the data model/schema.", "Propose and justify a technology stack."],
                        controls: { ...defaultControls, formality: 70, complexity: 85, tone: 'technical' },
                    }
                ]
            },
            {
                title: 'Conclusion & Appendices',
                sections: [
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: "Write a concise and impactful 'Conclusion' section for the report.",
                        behaviors: [{ name: 'expert technical writer', type: 'persona' }],
                        guidelines: ["Summarize key points and outcomes.", "Provide a forward-looking statement.", "Craft a strong, conclusive final statement."],
                        controls: { ...defaultControls, formality: 80, wordCount: "250" },
                    },
                    {
                        title: 'Recommendations',
                        type: 'report',
                        prompt: "Provide a set of actionable recommendations based on the report's findings.",
                        behaviors: [{ name: 'strategic analyst', type: 'persona' }],
                        guidelines: ["Structure as a numbered list.", "Ensure each recommendation is specific and relevant.", "Provide justification for each point."],
                        controls: { ...defaultControls, formality: 75 },
                    },
                    {
                        title: 'References',
                        type: 'report',
                        prompt: "Generate a 'References' section, listing all sources mentioned in the report.",
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ["Format all citations consistently using APA style.", "Ensure the list is alphabetically sorted."],
                        controls: { ...defaultControls, formality: 100, tone: 'academic' },
                    },
                    {
                        title: 'Appendices',
                        type: 'report',
                        prompt: "Compile supplementary materials like code snippets or large data tables into an 'Appendices' section.",
                        behaviors: [{ name: 'technical editor', type: 'persona' }],
                        guidelines: ["Label each appendix clearly (e.g., 'Appendix A: Source Code')."],
                        controls: { ...defaultControls },
                    }
                ]
            }
        ]
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        content: [
            {
                title: 'Executive Summary & Recommendations',
                sections: [
                    {
                        title: 'Introduction',
                        type: 'report',
                        prompt: "Write a brief introduction that states the report's purpose and the key problem being addressed.",
                        controls: { ...defaultControls, formality: 70, tone: 'professional', wordCount: "150" },
                    },
                    {
                        title: 'Key Analysis',
                        type: 'report',
                        prompt: "Summarize the most critical findings from the system analysis, focusing on business impact.",
                        controls: { ...defaultControls, formality: 70, complexity: 50 },
                    },
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: "Write a short conclusion that summarizes the main takeaways for a business audience.",
                        controls: { ...defaultControls, formality: 70, wordCount: "150" },
                    },
                    {
                        title: 'Recommendations',
                        type: 'report',
                        prompt: "Provide 3-5 clear, actionable recommendations based on the analysis.",
                        controls: { ...defaultControls, formality: 75 },
                    }
                ]
            }
        ]
    },
    {
        id: 'graduation-project',
        name: 'Graduation Project',
        description: 'A standard template for university final year or graduation projects.',
        content: [
            { title: 'Front Matter', sections: [ { title: 'Abstract', type: 'report', prompt:'' }, { title: 'Acknowledgment', type: 'report', prompt:'' } ] },
            { title: 'Chapter 1: Introduction', sections: [ { title: 'Introduction', type: 'report', prompt:'' }, { title: 'Problem Statement', type: 'report', prompt:'' }, { title: 'Project Objectives', type: 'report', prompt:'' }, { title: 'Project Scope', type: 'report', prompt:'' } ] },
            { title: 'Chapter 2: Literature Review', sections: [ { title: 'Literature Review', type: 'report', prompt:'' } ] },
            { title: 'Chapter 3: Methodology & Design', sections: [ { title: 'System Analysis', type: 'report', prompt:'' }, { title: 'System Design', type: 'report', prompt:'' } ] },
            { title: 'Chapter 4: Implementation & Testing', sections: [ { title: 'Implementation Details', type: 'report', prompt:'' }, { title: 'System Testing', type: 'report', prompt:'' } ] },
            { title: 'Chapter 5: Results & Discussion', sections: [ { title: 'Results', type: 'report', prompt:'' }, { title: 'Discussion', type: 'report', prompt:'' } ] },
            { title: 'Chapter 6: Conclusion & Future Work', sections: [ { title: 'Conclusion', type: 'report', prompt:'' }, { title: 'Future Work', type: 'report', prompt:'' } ] },
            { title: 'Back Matter', sections: [ { title: 'References', type: 'report', prompt:'' }, { title: 'Appendices', type: 'report', prompt:'' } ] }
        ]
    },
    {
        id: 'research-paper',
        name: 'Research Paper',
        description: 'A template following the standard IMRaD structure for academic research papers.',
        content: [
            { title: 'Front Matter', sections: [ { title: 'Abstract', type: 'report', prompt:'' } ] },
            { title: 'Introduction', sections: [ { title: 'Introduction', type: 'report', prompt:'' } ] },
            { title: 'Methods', sections: [ { title: 'Methodology', type: 'report', prompt:'' } ] },
            { title: 'Results', sections: [ { title: 'Results', type: 'report', prompt:'' } ] },
            { title: 'Discussion', sections: [ { title: 'Discussion', type: 'report', prompt:'' }, { title: 'Conclusion', type: 'report', prompt:'' } ] },
            { title: 'Back Matter', sections: [ { title: 'Acknowledgments', type: 'report', prompt:'' }, { title: 'References', type: 'report', prompt:'' } ] }
        ]
    },
    {
        id: 'business-proposal',
        name: 'Business Proposal',
        description: 'A persuasive template designed for pitching a new product, service, or project to clients or stakeholders.',
        content: [
            { title: 'Introduction', sections: [ { title: 'Executive Summary', type: 'report', prompt:'' }, { title: 'Problem Statement', type: 'report', prompt:'' } ] },
            { title: 'Proposed Solution', sections: [ { title: 'Solution Overview', type: 'report', prompt:'' }, { title: 'Deliverables', type: 'report', prompt:'' }, { title: 'Timeline & Milestones', type: 'report', prompt:'' } ] },
            { title: 'Pricing & Terms', sections: [ { title: 'Pricing Structure', type: 'report', prompt:'' }, { title: 'Terms & Conditions', type: 'report', prompt:'' } ] },
            { title: 'About Us', sections: [ { title: 'Company Overview', type: 'report', prompt:'' }, { title: 'Case Studies / Testimonials', type: 'report', prompt:'' } ] },
            { title: 'Conclusion', sections: [ { title: 'Next Steps & Call to Action', type: 'report', prompt:'' } ] }
        ]
    },
    {
        id: 'software-documentation',
        name: 'Software Documentation',
        description: 'A comprehensive template for creating user manuals or technical documentation for a software product.',
        content: [
            { title: 'Getting Started', sections: [ { title: 'Introduction', type: 'report', prompt:'' }, { title: 'Installation Guide', type: 'report', prompt:'' }, { title: 'Quick Start Tutorial', type: 'report', prompt:'' } ] },
            { title: 'Core Features', sections: [ { title: 'Feature A: Description & Usage', type: 'report', prompt:'' }, { title: 'Feature B: Description & Usage', type: 'report', prompt:'' } ] },
            { title: 'API Reference', sections: [ { title: 'Authentication API', type: 'report', prompt:'' }, { title: 'Endpoints Reference', type: 'report', prompt:'' } ] },
            { title: 'Troubleshooting', sections: [ { title: 'Frequently Asked Questions (FAQ)', type: 'report', prompt:'' }, { title: 'Error Codes Guide', type: 'report', prompt:'' } ] },
            { title: 'Support', sections: [ { title: 'Contacting Support', type: 'report', prompt:'' } ] }
        ]
    },
    {
        id: 'sdd-ieee-1016',
        name: "System Design Document (IEEE 1016)",
        description: "A comprehensive Software Design Description (SDD) based on IEEE standards, optimized for complex engineering projects.",
        content: [
            {
                title: "1. Introduction",
                sections: [
                    {
                        title: "Design Purpose",
                        type: "report",
                        prompt: "Define the specific purpose of this design document. Who is the intended audience (stakeholders, developers, testers)? What is the scope of the system being designed?",
                        behaviors: [{ name: "Senior Technical Writer", type: "persona" }],
                        controls: { formality: 90, tone: 'professional' },
                        guidelines: ["Be concise.", "Reference the SRD (Requirements Document) if available."]
                    },
                    {
                        title: "Definitions and Acronyms",
                        type: "report",
                        prompt: "List key technical terms, acronyms (e.g., API, REST, JWT), and abbreviations used in this document.",
                        controls: { outputStyle: { table: true, heading: false, paragraph: false, list: false, code: false, diagram: false, math: false }, tableCaption: "Glossary of Terms" }
                    }
                ]
            },
            {
                title: "2. Architectural Design",
                sections: [
                    {
                        title: "System Architecture Diagram",
                        type: "diagram",
                        prompt: "Create a C4 Component diagram or a High-Level Architecture diagram showing the system boundaries, containers (Web App, Mobile App, API, Database), and their interactions.",
                        behaviors: [{ name: "Software Architect", type: "persona" }],
                        controls: { diagramType: "component" },
                        constraints: ["Do not use vague cloud shapes without labels.", "Clearly indicate protocols (HTTPS, TCP)."]
                    },
                    {
                        title: "Architectural Patterns",
                        type: "report",
                        prompt: "Explain the architectural styles chosen (e.g., Microservices, Monolithic, Event-Driven). Justify these choices based on requirements like Scalability, Maintainability, and Performance.",
                        guidelines: ["Discuss trade-offs.", "Reference specific technologies (e.g., Kafka for events, Docker for containers)."]
                    }
                ]
            },
            {
                title: "3. Component Design",
                sections: [
                    {
                        title: "Database Schema (ERD)",
                        type: "diagram",
                        prompt: "Generate an Entity Relationship Diagram (ERD) representing the core data entities. Include User, Order, Product, and Payment entities with cardinality.",
                        controls: { diagramType: "er" }
                    },
                    {
                        title: "API Specification Strategy",
                        type: "report",
                        prompt: "Detail the API design strategy. Will it use REST or GraphQL? Describe standard response formats, error handling (HTTP 4xx/5xx), and authentication mechanisms (OAuth2/JWT).",
                        behaviors: [{ name: "Backend Lead", type: "persona" }],
                        guidelines: ["Include JSON examples for error responses.", "Mention Swagger/OpenAPI usage."]
                    }
                ]
            }
        ]
    },
   {
        id: 'ai-ml-research-paper',
        name: "AI/ML Research Paper",
        description: "Structure for publishing machine learning research, following IMRaD and ArXiv standards.",
        content: [
            {
                title: "Abstract",
                sections: [{
                    title: "Abstract",
                    type: "report",
                    prompt: "Write a 250-word abstract summarizing the research problem, the proposed model/methodology, the dataset used, and the state-of-the-art (SOTA) results achieved.",
                    controls: { tone: 'academic', formality: 100, citationStyle: 'IEEE' }
                }]
            },
            {
                title: "Methodology",
                sections: [
                    {
                        title: "Model Architecture",
                        type: "report",
                        prompt: "Describe the neural network architecture in detail. Explain the choice of layers (e.g., Transformer blocks, CNN layers, Attention mechanisms). Use mathematical notation for the loss functions.",
                        controls: { outputStyle: { paragraph: true, heading: true, list: false, table: false, code: false, diagram: false, math: false } },
                        behaviors: [{ name: "AI Researcher", type: "persona" }]
                    },
                    {
                        title: "Training Setup",
                        type: "report",
                        prompt: "Detail the training hyperparameters: Learning Rate, Optimizer (AdamW/SGD), Batch Size, Epochs, and Hardware used (GPU/TPU specifications).",
                        guidelines: ["Ensure reproducibility.", "Mention regularization techniques (Dropout, Weight Decay)."]
                    }
                ]
            }
        ]
    },
   {
        id: 'comp-eng-grad-project',
        name: "Computer Engineering Graduation Project",
        description: "A robust template for final year projects, covering analysis, implementation, and testing.",
        content: [
            {
                title: "Chapter 1: Introduction",
                sections: [
                    { title: "Problem Statement", type: "report", prompt: "Define the core problem. Why is this project necessary? What is the gap in current solutions?" },
                    { title: "Objectives", type: "report", prompt: "List the SMART objectives of the project." }
                ]
            },
            {
                title: "Chapter 2: Literature Review",
                sections: [
                    { title: "Related Work", type: "report", prompt: "Compare at least 3 similar existing systems. Create a comparison table highlighting features where your project excels." }
                ]
            },
            {
                title: "Chapter 3: System Implementation",
                sections: [
                    { 
                        title: "Algorithm Implementation", 
                        type: "report", 
                        prompt: "Provide the core algorithm used in the project (e.g., Pathfinding, Image Processing). Write clean, commented Python/C++ code.",
                        controls: { programmingLanguage: "python" }
                    }
                ]
            }
        ]
    }
];

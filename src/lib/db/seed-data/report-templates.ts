
import { defaultControls } from '@/lib/models';
import type { ReportTemplateProperties } from '@/lib/types';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        chapters: [
            {
                id: 'ch-front-matter',
                title: 'Front Matter',
                sections: [
                    {
                        id: 'abstract',
                        title: 'Abstract',
                        type: 'report',
                        content: '[Provide a concise summary of the project\'s objectives, methodology, key findings, and conclusions. This should be a self-contained overview of the entire report.]',
                        prompt: "Based on the provided context, write a concise and informative abstract for a training report. The abstract should summarize the purpose, methods, key experiences, and major conclusions of the training period.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ["Keep the abstract to a single paragraph and under 250 words.", "Clearly state the main objectives of the training.", "Briefly mention the key areas of the training program and technical skills acquired.", "Conclude with the most significant outcomes and recommendations."],
                        controls: { ...defaultControls, formality: 80, tone: 'academic' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'acknowledgment',
                        title: 'Acknowledgment',
                        type: 'report',
                        content: '[Thank individuals, supervisors, and organizations that supported the project. Be specific about their contributions.]',
                        prompt: "Based on the provided context, draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.",
                        behaviors: [{ name: 'professional writer', type: 'persona' }],
                        guidelines: ["Maintain a formal and appreciative tone.", "Mention specific roles like supervisors, team members, or company departments if context is available.", "Acknowledge the training institution or company by name."],
                        controls: { ...defaultControls, formality: 90, tone: 'formal' },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            },
            {
                id: 'ch-main-body',
                title: 'Main Body',
                sections: [
                    {
                        id: 'introduction',
                        title: 'Introduction',
                        type: 'report',
                        content: '[State the project\'s purpose, define the problem, and outline the report structure. This section sets the stage for the rest of the document.]',
                        prompt: "Based on the provided context, write a complete and professional introduction section for a formal report. Synthesize information to create a coherent and engaging introduction.",
                        behaviors: [{ name: 'expert technical writer specializing in project proposals', type: 'persona' }],
                        guidelines: ["Clearly state the purpose of the project.", "Define the problem the project addresses.", "Outline the report structure."],
                        controls: { ...defaultControls, formality: 75, complexity: 60, tone: 'professional', wordCount: "300" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'literature-review',
                        title: 'Literature Review',
                        type: 'report',
                        content: '[Review existing academic and technical literature relevant to the project. Identify key findings, trends, and research gaps.]',
                        prompt: "Write a comprehensive 'Literature Review' section for the final report. Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review.",
                        behaviors: [{ name: 'academic and technical writer', type: 'persona' }],
                        guidelines: ["Review and analyze academic literature.", "Describe relevant technological advancements.", "Identify key findings, trends, and research gaps."],
                        controls: { ...defaultControls, formality: 90, complexity: 80, tone: 'academic', wordCount: "1000" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-analysis',
                        title: 'System Analysis',
                        type: 'report',
                        content: '[Detail the functional, non-functional, data, and user requirements. Analyze stakeholder needs and the problems with existing systems.]',
                        prompt: "Write a thorough 'System Analysis' section, detailing functional and non-functional requirements.",
                        behaviors: [{ name: 'expert systems analyst', type: 'persona' }],
                        guidelines: ["Detail functional and data requirements.", "Describe non-functional requirements (performance, security, usability).", "Analyze stakeholder needs and problem scope."],
                        controls: { ...defaultControls, formality: 70, complexity: 75, tone: 'technical' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-design',
                        title: 'System Design',
                        type: 'report',
                        content: '[Describe the high-level architecture, data models, component breakdown, and technology stack for the proposed system.]',
                        prompt: "Create a comprehensive 'System Design' section, including architecture, data models, and technology stack.",
                        behaviors: [{ name: 'principal software architect', type: 'persona' }],
                        guidelines: ["Describe the high-level architecture.", "Outline the data model/schema.", "Propose and justify a technology stack."],
                        controls: { ...defaultControls, formality: 70, complexity: 85, tone: 'technical' },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            },
            {
                id: 'ch-conclusion',
                title: 'Conclusion & Appendices',
                sections: [
                    {
                        id: 'conclusion',
                        title: 'Conclusion',
                        type: 'report',
                        content: '[Summarize the key points of the report, reiterate the main findings, and provide a strong concluding statement.]',
                        prompt: "Write a concise and impactful 'Conclusion' section for the report.",
                        behaviors: [{ name: 'expert technical writer', type: 'persona' }],
                        guidelines: ["Summarize key points and outcomes.", "Provide a forward-looking statement.", "Craft a strong, conclusive final statement."],
                        controls: { ...defaultControls, formality: 80, wordCount: "250" },
                        context: { sections: { 'introduction': 'context', 'system-analysis': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        content: '[Provide a set of clear, actionable recommendations based on the findings of the report.]',
                        prompt: "Provide a set of actionable recommendations based on the report's findings.",
                        behaviors: [{ name: 'strategic analyst', type: 'persona' }],
                        guidelines: ["Structure as a numbered list.", "Ensure each recommendation is specific and relevant.", "Provide justification for each point."],
                        controls: { ...defaultControls, formality: 75 },
                        context: { sections: { 'conclusion': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'references',
                        title: 'References',
                        type: 'report',
                        content: '[List all sources cited throughout the report in a consistent format (e.g., APA, MLA).]',
                        prompt: "Generate a 'References' section, listing all sources mentioned in the report.",
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ["Format all citations consistently using APA style.", "Ensure the list is alphabetically sorted."],
                        controls: { ...defaultControls, formality: 100, tone: 'academic' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'appendices',
                        title: 'Appendices',
                        type: 'report',
                        content: '[Include supplementary materials such as detailed data, code snippets, or user survey results.]',
                        prompt: "Compile supplementary materials like code snippets or large data tables into an 'Appendices' section.",
                        behaviors: [{ name: 'technical editor', type: 'persona' }],
                        guidelines: ["Label each appendix clearly (e.g., 'Appendix A: Source Code')."],
                        controls: { ...defaultControls },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            }
        ]
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        chapters: [
            {
                id: 'ch-summary',
                title: 'Executive Summary & Recommendations',
                sections: [
                    {
                        id: 'introduction',
                        title: 'Introduction',
                        type: 'report',
                        content: '[Briefly state the report\'s purpose and the key problem or question it addresses.]',
                        prompt: "Write a brief introduction that states the report's purpose and the key problem being addressed.",
                        controls: { ...defaultControls, formality: 70, tone: 'professional', wordCount: "150" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-analysis',
                        title: 'Key Analysis',
                        type: 'report',
                        content: '[Summarize the most important findings and data from your analysis, focusing on insights that are relevant to business decisions.]',
                        prompt: "Summarize the most critical findings from the system analysis, focusing on business impact.",
                        controls: { ...defaultControls, formality: 70, complexity: 50 },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'conclusion',
                        title: 'Conclusion',
                        type: 'report',
                        content: '[Provide a short, direct conclusion that summarizes the main takeaways for a business audience.]',
                        prompt: "Write a short conclusion that summarizes the main takeaways for a business audience.",
                        controls: { ...defaultControls, formality: 70, wordCount: "150" },
                        context: { sections: { 'introduction': 'context', 'system-analysis': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        content: '[List 3-5 clear, actionable recommendations based on the analysis. Each recommendation should be direct and targeted.]',
                        prompt: "Provide 3-5 clear, actionable recommendations based on the analysis.",
                        controls: { ...defaultControls, formality: 75 },
                        context: { sections: { 'system-analysis': 'context', 'conclusion': 'context' }, externalContext: {} }
                    }
                ]
            }
        ]
    }
];

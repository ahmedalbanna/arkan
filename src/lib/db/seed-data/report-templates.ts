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
                        prompt: "You are an academic writer. Based on the provided context, write a concise and informative abstract for a training report. The abstract should summarize the purpose, methods, key experiences, and major conclusions of the training period.",
                        guidelines: ["Keep the abstract to a single paragraph and under 250 words.", "Clearly state the main objectives of the training.", "Briefly mention the key areas of the training program and technical skills acquired.", "Conclude with the most significant outcomes and recommendations."],
                        controls: { ...defaultControls, formality: 80, tone: 'academic' }
                    },
                    {
                        id: 'acknowledgment',
                        title: 'Acknowledgment',
                        type: 'report',
                        prompt: "You are a professional writer. Based on the provided context, draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.",
                        guidelines: ["Maintain a formal and appreciative tone.", "Mention specific roles like supervisors, team members, or company departments if context is available.", "Acknowledge the training institution or company by name."],
                        controls: { ...defaultControls, formality: 90, tone: 'formal' }
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
                        prompt: "You are an expert technical writer specializing in project proposals. Based on the provided context, write a complete and professional introduction section for the formal report. Synthesize information to create a coherent and engaging introduction.",
                        guidelines: ["Clearly state the purpose of the project.", "Define the problem the project addresses.", "Outline the report structure."],
                        controls: { ...defaultControls, formality: 75, complexity: 60, tone: 'professional', wordCount: "300" }
                    },
                    {
                        id: 'literature-review',
                        title: 'Literature Review',
                        type: 'report',
                        prompt: "You are an academic and technical writer. Write a comprehensive 'Literature Review' section for the final report. Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review.",
                        guidelines: ["Review and analyze academic literature.", "Describe relevant technological advancements.", "Identify key findings, trends, and research gaps."],
                        controls: { ...defaultControls, formality: 90, complexity: 80, tone: 'academic', wordCount: "1000" }
                    },
                    {
                        id: 'system-analysis',
                        title: 'System Analysis',
                        type: 'report',
                        prompt: "You are an expert systems analyst. Write a thorough 'System Analysis' section, detailing functional and non-functional requirements.",
                        guidelines: ["Detail functional and data requirements.", "Describe non-functional requirements (performance, security, usability).", "Analyze stakeholder needs and problem scope."],
                        controls: { ...defaultControls, formality: 70, complexity: 75, tone: 'technical' }
                    },
                    {
                        id: 'system-design',
                        title: 'System Design',
                        type: 'report',
                        prompt: "You are a principal software architect. Create a comprehensive 'System Design' section, including architecture, data models, and technology stack.",
                        guidelines: ["Describe the high-level architecture.", "Outline the data model/schema.", "Propose and justify a technology stack."],
                        controls: { ...defaultControls, formality: 70, complexity: 85, tone: 'technical' }
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
                        prompt: "You are an expert technical writer. Write a concise and impactful 'Conclusion' section for the report.",
                        guidelines: ["Summarize key points and outcomes.", "Provide a forward-looking statement.", "Craft a strong, conclusive final statement."],
                        controls: { ...defaultControls, formality: 80, wordCount: "250" }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        prompt: "You are a strategic analyst. Provide a set of actionable recommendations based on the report's findings.",
                        guidelines: ["Structure as a numbered list.", "Ensure each recommendation is specific and relevant.", "Provide justification for each point."],
                        controls: { ...defaultControls, formality: 75 }
                    },
                    {
                        id: 'references',
                        title: 'References',
                        type: 'report',
                        prompt: "You are an academic librarian. Generate a 'References' section, listing all sources mentioned in the report.",
                        guidelines: ["Format all citations consistently using APA style.", "Ensure the list is alphabetically sorted."],
                        controls: { ...defaultControls, formality: 100, tone: 'academic' }
                    },
                    {
                        id: 'appendices',
                        title: 'Appendices',
                        type: 'report',
                        prompt: "You are a technical editor. Compile supplementary materials like code snippets or large data tables into an 'Appendices' section.",
                        guidelines: ["Label each appendix clearly (e.g., 'Appendix A: Source Code')."],
                        controls: { ...defaultControls }
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
                        prompt: "Write a brief introduction that states the report's purpose and the key problem being addressed.",
                        controls: { ...defaultControls, formality: 70, tone: 'professional', wordCount: "150" }
                    },
                    {
                        id: 'system-analysis',
                        title: 'Key Analysis',
                        type: 'report',
                        prompt: "Summarize the most critical findings from the system analysis, focusing on business impact.",
                        controls: { ...defaultControls, formality: 70, complexity: 50 }
                    },
                    {
                        id: 'conclusion',
                        title: 'Conclusion',
                        type: 'report',
                        prompt: "Write a short conclusion that summarizes the main takeaways for a business audience.",
                        controls: { ...defaultControls, formality: 70, wordCount: "150" }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        prompt: "Provide 3-5 clear, actionable recommendations based on the analysis.",
                        controls: { ...defaultControls, formality: 75 }
                    }
                ]
            }
        ]
    }
];

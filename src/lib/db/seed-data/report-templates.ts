

import { defaultControls, ReportTemplateProperties } from '@/lib/models';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        projectType: 'Technical Report',
        educationalLevel: 'Professional',
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
                        controls: { ...defaultControls, formality: 90, tone: 'professional' },
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
        projectType: 'Business Report',
        educationalLevel: 'Professional',
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
        projectType: 'Graduation Project',
        educationalLevel: 'Undergraduate',
        content: [
            { 
                title: 'Front Matter', 
                sections: [ 
                    { 
                        title: 'Abstract', 
                        type: 'report', 
                        prompt: 'Write a concise and informative abstract for this graduation project. The abstract should summarize the project purpose, methodology, key results, and major conclusions in 250-300 words.',
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Keep the abstract to a single paragraph', 'Clearly state the main objectives', 'Briefly mention the methodology and approach', 'Highlight key results and contributions', 'Conclude with the most significant outcomes'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', wordCount: '250' }
                    }, 
                    { 
                        title: 'Acknowledgment', 
                        type: 'report', 
                        prompt: 'Draft a heartfelt and professional acknowledgment section. Thank individuals, supervisors, and organizations that supported this graduation project.',
                        behaviors: [{ name: 'professional writer', type: 'persona' }],
                        guidelines: ['Maintain a formal and appreciative tone', 'Mention supervisors and advisors', 'Acknowledge family and friends if appropriate', 'Thank the university and department'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 1: Introduction', 
                sections: [ 
                    { 
                        title: 'Introduction', 
                        type: 'report', 
                        prompt: 'Write a comprehensive introduction that provides background information and context for this graduation project. Explain the domain, motivation, and importance of the project.',
                        behaviors: [{ name: 'expert technical writer', type: 'persona' }],
                        guidelines: ['Provide background and context', 'Explain why this project is important', 'Introduce the problem domain', 'Outline the structure of the report'],
                        controls: { ...defaultControls, formality: 80, complexity: 65, tone: 'professional', wordCount: '500' }
                    }, 
                    { 
                        title: 'Problem Statement', 
                        type: 'report', 
                        prompt: 'Define the core problem that this graduation project addresses. Be specific about the challenges, gaps, or issues that need to be solved.',
                        behaviors: [{ name: 'systems analyst', type: 'persona' }],
                        guidelines: ['Clearly define the problem', 'Explain why existing solutions are inadequate', 'Quantify the impact if possible', 'Be specific and focused'],
                        controls: { ...defaultControls, formality: 80, complexity: 70, tone: 'academic', wordCount: '400' }
                    }, 
                    { 
                        title: 'Project Objectives', 
                        type: 'report', 
                        prompt: 'List and explain the specific objectives of this graduation project. Use SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['List 3-5 clear objectives', 'Make objectives measurable and specific', 'Ensure objectives align with the problem statement', 'Use action verbs'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional' }
                    }, 
                    { 
                        title: 'Project Scope', 
                        type: 'report', 
                        prompt: 'Define what is included and excluded in this graduation project. Be clear about boundaries, limitations, and constraints.',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Clearly state what is included', 'Explicitly mention what is excluded', 'Identify assumptions and constraints', 'Define project boundaries'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 2: Literature Review', 
                sections: [ 
                    { 
                        title: 'Literature Review', 
                        type: 'report', 
                        prompt: 'Write a comprehensive literature review that surveys existing work, research, and solutions related to this graduation project. Identify gaps and justify the need for this project.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Review relevant academic papers and publications', 'Analyze existing systems and solutions', 'Compare different approaches', 'Identify research gaps', 'Justify how this project fills the gap'],
                        controls: { ...defaultControls, formality: 90, complexity: 80, tone: 'academic', wordCount: '1500' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 3: Methodology & Design', 
                sections: [ 
                    { 
                        title: 'System Analysis', 
                        type: 'report', 
                        prompt: 'Provide a thorough system analysis detailing functional and non-functional requirements, stakeholder needs, and system constraints.',
                        behaviors: [{ name: 'systems analyst', type: 'persona' }],
                        guidelines: ['List functional requirements', 'Specify non-functional requirements (performance, security, usability)', 'Analyze stakeholder needs', 'Document system constraints'],
                        controls: { ...defaultControls, formality: 80, complexity: 75, tone: 'technical', wordCount: '800' }
                    }, 
                    { 
                        title: 'System Design', 
                        type: 'report', 
                        prompt: 'Create a comprehensive system design section including architecture, components, data models, and technology stack.',
                        behaviors: [{ name: 'software architect', type: 'persona' }],
                        guidelines: ['Describe the high-level architecture', 'Detail system components and their interactions', 'Present data models and schemas', 'Justify technology choices'],
                        controls: { ...defaultControls, formality: 80, complexity: 85, tone: 'technical', wordCount: '1000' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 4: Implementation & Testing', 
                sections: [ 
                    { 
                        title: 'Implementation Details', 
                        type: 'report', 
                        prompt: 'Describe the implementation process, technologies used, development environment, and key implementation decisions.',
                        behaviors: [{ name: 'software engineer', type: 'persona' }],
                        guidelines: ['Describe the development environment', 'Explain key implementation decisions', 'Discuss challenges encountered and solutions', 'Include relevant code snippets if needed'],
                        controls: { ...defaultControls, formality: 75, complexity: 75, tone: 'technical', wordCount: '800' }
                    }, 
                    { 
                        title: 'System Testing', 
                        type: 'report', 
                        prompt: 'Document the testing methodology, test cases, test results, and quality assurance processes.',
                        behaviors: [{ name: 'QA engineer', type: 'persona' }],
                        guidelines: ['Describe testing strategy and methodology', 'Present test cases and scenarios', 'Report test results with metrics', 'Discuss bugs found and fixes'],
                        controls: { ...defaultControls, formality: 80, complexity: 70, tone: 'technical', wordCount: '700' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 5: Results & Discussion', 
                sections: [ 
                    { 
                        title: 'Results', 
                        type: 'report', 
                        prompt: 'Present the project results with data, measurements, and evaluations. Use tables, charts, and metrics to demonstrate outcomes.',
                        behaviors: [{ name: 'data analyst', type: 'persona' }],
                        guidelines: ['Present results objectively', 'Use tables and charts to visualize data', 'Compare against objectives and requirements', 'Report on system performance'],
                        controls: { ...defaultControls, formality: 85, complexity: 70, tone: 'academic', wordCount: '600' }
                    }, 
                    { 
                        title: 'Discussion', 
                        type: 'report', 
                        prompt: 'Interpret and discuss the results. Compare with existing solutions, explain successes and limitations, and provide critical analysis.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Interpret the results', 'Compare with related work', 'Discuss strengths and limitations', 'Explain unexpected findings', 'Address research questions'],
                        controls: { ...defaultControls, formality: 85, complexity: 75, tone: 'academic', wordCount: '700' }
                    } 
                ] 
            },
            { 
                title: 'Chapter 6: Conclusion & Future Work', 
                sections: [ 
                    { 
                        title: 'Conclusion', 
                        type: 'report', 
                        prompt: 'Write a concise conclusion that summarizes the project achievements, contributions, and key findings.',
                        behaviors: [{ name: 'expert technical writer', type: 'persona' }],
                        guidelines: ['Summarize key achievements', 'Restate how objectives were met', 'Highlight main contributions', 'Provide a strong closing statement'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', wordCount: '400' }
                    }, 
                    { 
                        title: 'Future Work', 
                        type: 'report', 
                        prompt: 'Suggest potential improvements, extensions, and future research directions for this project.',
                        behaviors: [{ name: 'research advisor', type: 'persona' }],
                        guidelines: ['Propose concrete future enhancements', 'Identify areas for further research', 'Suggest scalability improvements', 'Be realistic and specific'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', wordCount: '350' }
                    } 
                ] 
            },
            { 
                title: 'Back Matter', 
                sections: [ 
                    { 
                        title: 'References', 
                        type: 'report', 
                        prompt: 'Generate a properly formatted references section listing all sources cited in the report.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Format citations consistently using APA or IEEE style', 'Alphabetically sort the list', 'Ensure all in-text citations have corresponding references'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    }, 
                    { 
                        title: 'Appendices', 
                        type: 'report', 
                        prompt: 'Compile supplementary materials such as code listings, detailed diagrams, user manuals, or additional data.',
                        behaviors: [{ name: 'technical editor', type: 'persona' }],
                        guidelines: ['Label each appendix clearly (e.g., Appendix A, B, C)', 'Include only relevant supplementary material', 'Reference appendices in the main text'],
                        controls: { ...defaultControls, formality: 75 }
                    } 
                ] 
            }
        ]
    },
    {
        id: 'research-paper',
        name: 'Research Paper',
        description: 'A template following the standard IMRaD structure for academic research papers.',
        projectType: 'Research Paper',
        educationalLevel: 'Graduate',
        content: [
            { 
                title: 'Front Matter', 
                sections: [ 
                    { 
                        title: 'Abstract', 
                        type: 'report', 
                        prompt: 'Write a structured abstract following the IMRaD format. Include: Background/Context, Objective, Methods, Results, and Conclusion. Keep it to 250-300 words.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Follow IMRaD structure within the abstract', 'Be concise and informative', 'Include key findings with specific data', 'Avoid citations in the abstract', 'Write in past tense for methods and results'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 75, wordCount: '250' }
                    } 
                ] 
            },
            { 
                title: 'Introduction', 
                sections: [ 
                    { 
                        title: 'Introduction', 
                        type: 'report', 
                        prompt: 'Write a comprehensive introduction that establishes the research context, reviews relevant literature, identifies the research gap, and clearly states the research question/hypothesis and objectives.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Start broad and narrow down to your specific topic', 'Review key literature and identify gaps', 'Clearly state your research question or hypothesis', 'Explain the significance and contribution of your research', 'End with a brief outline of the paper structure'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '800' }
                    } 
                ] 
            },
            { 
                title: 'Methods', 
                sections: [ 
                    { 
                        title: 'Methodology', 
                        type: 'report', 
                        prompt: 'Describe the research methodology in sufficient detail to allow replication. Include: study design, participants/materials, procedures, data collection methods, and analysis techniques.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Write in past tense', 'Provide enough detail for replication', 'Justify your methodological choices', 'Describe sampling methods and sample size', 'Explain data collection and analysis procedures', 'Address ethical considerations if applicable'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 80, wordCount: '700' }
                    } 
                ] 
            },
            { 
                title: 'Results', 
                sections: [ 
                    { 
                        title: 'Results', 
                        type: 'report', 
                        prompt: 'Present your findings objectively and systematically. Use tables, figures, and statistical analysis to support your results. Report all relevant findings without interpretation.',
                        behaviors: [{ name: 'data analyst', type: 'persona' }],
                        guidelines: ['Present results in logical order', 'Use tables and figures effectively', 'Report statistical significance when applicable', 'Be objective - no interpretation here', 'Include both positive and negative findings'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 75, wordCount: '600', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    } 
                ] 
            },
            { 
                title: 'Discussion', 
                sections: [ 
                    { 
                        title: 'Discussion', 
                        type: 'report', 
                        prompt: 'Interpret your results, compare them with previous research, explain implications, acknowledge limitations, and suggest future research directions.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Interpret your findings in light of your research question', 'Compare results with existing literature', 'Explain unexpected findings', 'Acknowledge study limitations honestly', 'Discuss theoretical and practical implications', 'Suggest directions for future research'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '900' }
                    }, 
                    { 
                        title: 'Conclusion', 
                        type: 'report', 
                        prompt: 'Summarize the main findings, restate their significance, and provide a strong closing statement about the contribution to the field.',
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Summarize key findings concisely', 'Restate the significance of your research', 'Avoid introducing new information', 'Provide a strong closing statement', 'Keep it brief and impactful'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', wordCount: '300' }
                    } 
                ] 
            },
            { 
                title: 'Back Matter', 
                sections: [ 
                    { 
                        title: 'Acknowledgments', 
                        type: 'report', 
                        prompt: 'Acknowledge individuals, institutions, and funding sources that contributed to the research. Be professional and concise.',
                        behaviors: [{ name: 'professional writer', type: 'persona' }],
                        guidelines: ['Thank funding sources first', 'Acknowledge technical or editorial assistance', 'Mention institutional support', 'Be brief and professional'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional' }
                    }, 
                    { 
                        title: 'References', 
                        type: 'report', 
                        prompt: 'Compile a complete reference list of all sources cited in the paper. Format according to the required citation style (APA, MLA, Chicago, or IEEE).',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Include all and only cited sources', 'Format consistently according to the chosen style', 'Alphabetize by first author surname', 'Double-check accuracy of all citations', 'Include DOIs for journal articles when available'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    } 
                ] 
            }
        ]
    },
    {
        id: 'business-proposal',
        name: 'Business Proposal',
        description: 'A persuasive template designed for pitching a new product, service, or project to clients or stakeholders.',
        projectType: 'Business Proposal',
        educationalLevel: 'Professional',
        content: [
            { 
                title: 'Introduction', 
                sections: [ 
                    { 
                        title: 'Executive Summary', 
                        type: 'report', 
                        prompt: 'Write a compelling executive summary that captures the essence of your proposal. Include the problem, your solution, key benefits, and expected outcomes. This should hook the reader immediately.',
                        behaviors: [{ name: 'business strategist', type: 'persona' }],
                        guidelines: ['Start with the most important information', 'Keep it to one page or less', 'Focus on business value and ROI', 'Be clear and persuasive', 'Include specific numbers and benefits'],
                        controls: { ...defaultControls, formality: 75, tone: 'persuasive', complexity: 60, wordCount: '400' }
                    }, 
                    { 
                        title: 'Problem Statement', 
                        type: 'report', 
                        prompt: 'Clearly define the business problem or opportunity. Show deep understanding of the client\'s challenges and pain points. Use data and examples to illustrate the impact.',
                        behaviors: [{ name: 'business analyst', type: 'persona' }],
                        guidelines: ['Demonstrate understanding of client needs', 'Quantify the problem with data', 'Show the cost of inaction', 'Connect emotionally with pain points', 'Set up your solution naturally'],
                        controls: { ...defaultControls, formality: 70, tone: 'professional', complexity: 65, wordCount: '350' }
                    } 
                ] 
            },
            { 
                title: 'Proposed Solution', 
                sections: [ 
                    { 
                        title: 'Solution Overview', 
                        type: 'report', 
                        prompt: 'Present your solution in detail. Explain how it addresses the problem, what makes it unique, and why it\'s the best approach. Focus on benefits, not just features.',
                        behaviors: [{ name: 'solution architect', type: 'persona' }],
                        guidelines: ['Focus on benefits over features', 'Explain your unique value proposition', 'Use clear, jargon-free language', 'Show how it solves the specific problem', 'Include visuals or diagrams if relevant'],
                        controls: { ...defaultControls, formality: 70, tone: 'persuasive', complexity: 70, wordCount: '600' }
                    }, 
                    { 
                        title: 'Deliverables', 
                        type: 'report', 
                        prompt: 'List and describe all deliverables the client will receive. Be specific and concrete about what they\'re getting. Use bullet points or a table for clarity.',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Be specific and concrete', 'List deliverables in logical order', 'Include tangible and intangible items', 'Specify formats and quantities', 'Make it easy to scan'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }, 
                    { 
                        title: 'Timeline & Milestones', 
                        type: 'report', 
                        prompt: 'Provide a realistic project timeline with key milestones. Show phases, durations, and dependencies. Demonstrate project management capability.',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Break down into clear phases', 'Set realistic timeframes', 'Highlight key milestones', 'Show dependencies between tasks', 'Include a visual timeline if possible'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    } 
                ] 
            },
            { 
                title: 'Pricing & Terms', 
                sections: [ 
                    { 
                        title: 'Pricing Structure', 
                        type: 'report', 
                        prompt: 'Present your pricing clearly and transparently. Break down costs by component or phase. Show the value and justify the investment.',
                        behaviors: [{ name: 'financial analyst', type: 'persona' }],
                        guidelines: ['Be transparent and clear', 'Break down costs logically', 'Justify pricing with value', 'Offer options if appropriate', 'Make pricing easy to understand'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }, 
                    { 
                        title: 'Terms & Conditions', 
                        type: 'report', 
                        prompt: 'Outline key terms and conditions including payment terms, cancellation policy, warranties, and any limitations. Be fair and clear.',
                        behaviors: [{ name: 'contract specialist', type: 'persona' }],
                        guidelines: ['Use clear, plain language', 'Be fair and balanced', 'Cover payment terms', 'Include important legal protections', 'Format for easy reference'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    } 
                ] 
            },
            { 
                title: 'About Us', 
                sections: [ 
                    { 
                        title: 'Company Overview', 
                        type: 'report', 
                        prompt: 'Introduce your company, highlighting relevant experience, expertise, and credentials. Build credibility and trust.',
                        behaviors: [{ name: 'marketing specialist', type: 'persona' }],
                        guidelines: ['Focus on relevant credentials', 'Highlight unique strengths', 'Show track record of success', 'Build trust and credibility', 'Keep it concise'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', complexity: 60, wordCount: '350' }
                    }, 
                    { 
                        title: 'Case Studies / Testimonials', 
                        type: 'report', 
                        prompt: 'Share relevant case studies or client testimonials that demonstrate your success with similar projects. Use specific results and numbers.',
                        behaviors: [{ name: 'marketing specialist', type: 'persona' }],
                        guidelines: ['Choose relevant examples', 'Include specific results and numbers', 'Use direct quotes from clients', 'Show before/after improvements', 'Keep testimonials authentic'],
                        controls: { ...defaultControls, formality: 70, tone: 'professional', complexity: 60 }
                    } 
                ] 
            },
            { 
                title: 'Conclusion', 
                sections: [ 
                    { 
                        title: 'Next Steps & Call to Action', 
                        type: 'report', 
                        prompt: 'Summarize key points, express confidence in the partnership, and provide clear next steps. Include a strong call to action with contact information.',
                        behaviors: [{ name: 'sales specialist', type: 'persona' }],
                        guidelines: ['Summarize key benefits', 'Express enthusiasm and confidence', 'Provide clear next steps', 'Make it easy to say yes', 'Include contact information', 'Create urgency if appropriate'],
                        controls: { ...defaultControls, formality: 70, tone: 'persuasive', wordCount: '300' }
                    } 
                ] 
            }
        ]
    },
    {
        id: 'software-documentation',
        name: 'Software Documentation',
        description: 'A comprehensive template for creating user manuals or technical documentation for a software product.',
        projectType: 'Software Documentation',
        educationalLevel: 'Professional',
        content: [
            { 
                title: 'Getting Started', 
                sections: [ 
                    { 
                        title: 'Introduction', 
                        type: 'report', 
                        prompt: 'Write a welcoming introduction to the software. Explain what it does, who it\'s for, key features, and what users will learn from this documentation.',
                        behaviors: [{ name: 'technical writer', type: 'persona' }],
                        guidelines: ['Welcome the user warmly', 'Clearly state what the software does', 'Identify target audience', 'List key features briefly', 'Set expectations for the documentation'],
                        controls: { ...defaultControls, formality: 65, tone: 'casual', complexity: 50, wordCount: '300' }
                    }, 
                    { 
                        title: 'Installation Guide', 
                        type: 'report', 
                        prompt: 'Provide step-by-step installation instructions for all supported platforms. Include system requirements, prerequisites, and common installation issues.',
                        behaviors: [{ name: 'technical writer', type: 'persona' }],
                        guidelines: ['List system requirements first', 'Provide step-by-step instructions', 'Include screenshots or code blocks', 'Cover all supported platforms', 'Address common installation problems', 'Verify installation steps'],
                        controls: { ...defaultControls, formality: 70, tone: 'explanatory', complexity: 60, outputStyle: { ...defaultControls.outputStyle, list: true, code: true } }
                    }, 
                    { 
                        title: 'Quick Start Tutorial', 
                        type: 'report', 
                        prompt: 'Create a simple tutorial that gets users from zero to their first success quickly. Focus on the most common use case and keep it simple.',
                        behaviors: [{ name: 'technical trainer', type: 'persona' }],
                        guidelines: ['Choose the simplest use case', 'Break into clear numbered steps', 'Include code examples or screenshots', 'Show expected results', 'Keep it short and achievable', 'End with a sense of accomplishment'],
                        controls: { ...defaultControls, formality: 60, tone: 'explanatory', complexity: 50, outputStyle: { ...defaultControls.outputStyle, code: true } }
                    } 
                ] 
            },
            { 
                title: 'Core Features', 
                sections: [ 
                    { 
                        title: 'Feature A: Description & Usage', 
                        type: 'report', 
                        prompt: 'Document a core feature comprehensively. Explain what it does, why it\'s useful, how to use it, and provide code examples or screenshots.',
                        behaviors: [{ name: 'technical writer', type: 'persona' }],
                        guidelines: ['Start with feature overview', 'Explain use cases', 'Provide step-by-step usage instructions', 'Include code examples', 'Show common patterns', 'List parameters and options'],
                        controls: { ...defaultControls, formality: 70, tone: 'explanatory', complexity: 65, outputStyle: { ...defaultControls.outputStyle, code: true, heading: true } }
                    }, 
                    { 
                        title: 'Feature B: Description & Usage', 
                        type: 'report', 
                        prompt: 'Document another core feature with the same level of detail. Maintain consistency with Feature A documentation.',
                        behaviors: [{ name: 'technical writer', type: 'persona' }],
                        guidelines: ['Follow same structure as Feature A', 'Explain feature purpose', 'Provide usage examples', 'Include code samples', 'Document all options', 'Show best practices'],
                        controls: { ...defaultControls, formality: 70, tone: 'explanatory', complexity: 65, outputStyle: { ...defaultControls.outputStyle, code: true, heading: true } }
                    } 
                ] 
            },
            { 
                title: 'API Reference', 
                sections: [ 
                    { 
                        title: 'Authentication API', 
                        type: 'report', 
                        prompt: 'Document authentication mechanisms in detail. Include authentication flow, how to obtain tokens, how to use them, and security best practices.',
                        behaviors: [{ name: 'API documentation specialist', type: 'persona' }],
                        guidelines: ['Explain authentication flow clearly', 'Show how to obtain credentials', 'Provide example requests', 'Document token usage', 'Include security best practices', 'Show error handling'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 75, outputStyle: { ...defaultControls.outputStyle, code: true } }
                    }, 
                    { 
                        title: 'Endpoints Reference', 
                        type: 'report', 
                        prompt: 'Document all API endpoints systematically. For each endpoint: HTTP method, URL, parameters, request body, response format, status codes, and examples.',
                        behaviors: [{ name: 'API documentation specialist', type: 'persona' }],
                        guidelines: ['Use consistent format for each endpoint', 'List all HTTP methods', 'Document all parameters', 'Show request/response examples', 'List all status codes', 'Include error responses'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, code: true, table: true } }
                    } 
                ] 
            },
            { 
                title: 'Troubleshooting', 
                sections: [ 
                    { 
                        title: 'Frequently Asked Questions (FAQ)', 
                        type: 'report', 
                        prompt: 'Compile common questions and provide clear, helpful answers. Organize by topic and make them easy to scan.',
                        behaviors: [{ name: 'support specialist', type: 'persona' }],
                        guidelines: ['Organize by topic', 'Use question format for each entry', 'Provide clear, concise answers', 'Include links to relevant docs', 'Address most common issues first', 'Keep answers actionable'],
                        controls: { ...defaultControls, formality: 65, tone: 'explanatory', complexity: 55, outputStyle: { ...defaultControls.outputStyle, heading: true } }
                    }, 
                    { 
                        title: 'Error Codes Guide', 
                        type: 'report', 
                        prompt: 'Document all error codes systematically. For each error: code, description, common causes, and how to resolve it.',
                        behaviors: [{ name: 'technical support engineer', type: 'persona' }],
                        guidelines: ['List errors systematically', 'Explain what each error means', 'Describe common causes', 'Provide clear solutions', 'Include examples', 'Make it searchable'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 65, outputStyle: { ...defaultControls.outputStyle, table: true, code: true } }
                    } 
                ] 
            },
            { 
                title: 'Support', 
                sections: [ 
                    { 
                        title: 'Contacting Support', 
                        type: 'report', 
                        prompt: 'Provide information on how to get help. Include support channels, response times, what information to provide, and links to community resources.',
                        behaviors: [{ name: 'customer support manager', type: 'persona' }],
                        guidelines: ['List all support channels', 'Provide contact information', 'Set response time expectations', 'Explain what info to include in requests', 'Link to community forums', 'Include emergency contact if applicable'],
                        controls: { ...defaultControls, formality: 70, tone: 'explanatory', complexity: 50 }
                    } 
                ] 
            }
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
        projectType: 'AI/ML Research Paper',
        specialization: 'Artificial Intelligence',
        educationalLevel: 'Graduate',
        content: [
            {
                title: "Abstract",
                sections: [{
                    title: "Abstract",
                    type: "report",
                    prompt: "Write a 250-word abstract summarizing the research problem, the proposed model/methodology, the dataset used, and the state-of-the-art (SOTA) results achieved. Follow ArXiv standards.",
                    behaviors: [{ name: 'AI researcher', type: 'persona' }],
                    guidelines: ['State the problem clearly', 'Describe the proposed approach', 'Mention dataset and experimental setup', 'Report key metrics and results', 'Compare with SOTA if applicable', 'Write in past tense'],
                    controls: { ...defaultControls, tone: 'academic', formality: 100, complexity: 85, wordCount: '250', citationStyle: 'IEEE' }
                }]
            },
            {
                title: "Introduction",
                sections: [{
                    title: "Introduction",
                    type: "report",
                    prompt: "Introduce the problem domain, motivate the research, review related work briefly, identify the gap, and state your contribution clearly.",
                    behaviors: [{ name: 'AI researcher', type: 'persona' }],
                    guidelines: ['Start with the problem context', 'Explain why it matters', 'Brief literature review', 'Identify the research gap', 'State contributions explicitly', 'Preview the paper structure'],
                    controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '700' }
                }]
            },
            {
                title: "Related Work",
                sections: [{
                    title: "Related Work",
                    type: "report",
                    prompt: "Review relevant prior work systematically. Compare different approaches, identify their limitations, and position your work within the literature.",
                    behaviors: [{ name: 'AI researcher', type: 'persona' }],
                    guidelines: ['Organize by theme or chronologically', 'Compare approaches systematically', 'Identify limitations of existing work', 'Show how your work differs', 'Cite key papers', 'Be fair and objective'],
                    controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '800', citationStyle: 'IEEE' }
                }]
            },
            {
                title: "Methodology",
                sections: [
                    {
                        title: "Model Architecture",
                        type: "report",
                        prompt: "Describe the neural network architecture in detail. Explain the choice of layers (e.g., Transformer blocks, CNN layers, Attention mechanisms). Use mathematical notation for key equations and loss functions.",
                        behaviors: [{ name: "AI researcher", type: "persona" }],
                        guidelines: ['Describe architecture systematically', 'Explain design choices', 'Use mathematical notation', 'Include architecture diagram if needed', 'Specify dimensions and parameters', 'Justify architectural decisions'],
                        controls: { ...defaultControls, formality: 95, tone: 'technical', complexity: 90, outputStyle: { ...defaultControls.outputStyle, paragraph: true, heading: true, math: true } }
                    },
                    {
                        title: "Training Setup",
                        type: "report",
                        prompt: "Detail the training hyperparameters: Learning Rate, Optimizer (AdamW/SGD), Batch Size, Epochs, and Hardware used (GPU/TPU specifications). Include data preprocessing and augmentation.",
                        behaviors: [{ name: 'machine learning engineer', type: 'persona' }],
                        guidelines: ["List all hyperparameters", "Ensure reproducibility", "Mention regularization techniques (Dropout, Weight Decay)", "Describe data preprocessing", "Specify hardware and training time", "Include convergence criteria"],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: "Dataset",
                        type: "report",
                        prompt: "Describe the dataset in detail: source, size, preprocessing, train/val/test splits, class distribution, and any data augmentation techniques used.",
                        behaviors: [{ name: 'data scientist', type: 'persona' }],
                        guidelines: ['Describe dataset characteristics', 'Report statistics (size, classes, splits)', 'Explain preprocessing steps', 'Detail augmentation if used', 'Address class imbalance', 'Mention any limitations'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: "Experiments & Results",
                sections: [
                    {
                        title: "Experimental Setup",
                        type: "report",
                        prompt: "Describe evaluation metrics, baseline models, ablation studies, and experimental protocol. Ensure reproducibility.",
                        behaviors: [{ name: 'AI researcher', type: 'persona' }],
                        guidelines: ['Define evaluation metrics clearly', 'Describe baseline models', 'Explain experimental protocol', 'List ablation studies', 'Ensure reproducibility', 'Specify statistical tests'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 85 }
                    },
                    {
                        title: "Results",
                        type: "report",
                        prompt: "Present results systematically with tables and figures. Compare with baselines and SOTA. Report all relevant metrics including confidence intervals or statistical significance.",
                        behaviors: [{ name: 'AI researcher', type: 'persona' }],
                        guidelines: ['Present results in tables', 'Compare with baselines', 'Report SOTA comparison', 'Include confidence intervals', 'Show ablation study results', 'Use visualizations effectively'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    },
                    {
                        title: "Analysis & Discussion",
                        type: "report",
                        prompt: "Analyze results deeply. Explain what worked and why, discuss failure cases, provide visualizations, and interpret model behavior.",
                        behaviors: [{ name: 'AI researcher', type: 'persona' }],
                        guidelines: ['Interpret results thoroughly', 'Explain unexpected findings', 'Analyze failure cases', 'Show qualitative results', 'Discuss model behavior', 'Connect to research question'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85, wordCount: '800' }
                    }
                ]
            },
            {
                title: "Conclusion",
                sections: [
                    {
                        title: "Conclusion",
                        type: "report",
                        prompt: "Summarize contributions, key findings, and impact. Acknowledge limitations and suggest future work directions.",
                        behaviors: [{ name: 'AI researcher', type: 'persona' }],
                        guidelines: ['Summarize main contributions', 'Restate key findings', 'Acknowledge limitations honestly', 'Suggest future research directions', 'Discuss broader impact', 'End strongly'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 80, wordCount: '400' }
                    }
                ]
            },
            {
                title: "References",
                sections: [{
                    title: "References",
                    type: "report",
                    prompt: "Compile complete references in IEEE format. Include all cited papers with DOIs and ArXiv IDs where applicable.",
                    behaviors: [{ name: 'academic librarian', type: 'persona' }],
                    guidelines: ['Use IEEE citation format', 'Include DOIs', 'Add ArXiv IDs for preprints', 'Alphabetize by first author', 'Ensure completeness', 'Double-check accuracy'],
                    controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'IEEE' }
                }]
            }
        ]
    },
   {
        id: 'comp-eng-grad-project',
        name: "Computer Engineering Graduation Project",
        description: "A robust template for final year projects, covering analysis, implementation, and testing.",
        projectType: 'Graduation Project',
        specialization: 'Computer Engineering',
        educationalLevel: 'Undergraduate',
        content: [
            {
                title: "Chapter 1: Introduction",
                sections: [
                    { 
                        title: "Problem Statement", 
                        type: "report", 
                        prompt: "Define the core problem this project addresses. Explain why it's necessary, what gap exists in current solutions, and the impact of solving it.",
                        behaviors: [{ name: 'systems analyst', type: 'persona' }],
                        guidelines: ['Clearly define the problem', 'Explain the gap in existing solutions', 'Quantify the impact if possible', 'Connect to real-world needs', 'Be specific and focused'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 70, wordCount: '400' }
                    },
                    { 
                        title: "Objectives", 
                        type: "report", 
                        prompt: "List the SMART objectives of the project. Each objective should be Specific, Measurable, Achievable, Relevant, and Time-bound.",
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['List 4-6 clear objectives', 'Use SMART criteria', 'Make objectives measurable', 'Use action verbs', 'Align with problem statement'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    { 
                        title: "Project Scope", 
                        type: "report", 
                        prompt: "Define what is included and excluded in this project. Specify system boundaries, constraints, and assumptions.",
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Clearly state what is in scope', 'Explicitly list what is out of scope', 'Document assumptions', 'Identify constraints (time, budget, technology)', 'Define system boundaries'],
                        controls: { ...defaultControls, formality: 75, tone: 'technical', complexity: 65 }
                    }
                ]
            },
            {
                title: "Chapter 2: Literature Review",
                sections: [
                    { 
                        title: "Related Work", 
                        type: "report", 
                        prompt: "Compare at least 3 similar existing systems or solutions. Create a detailed comparison analyzing features, advantages, disadvantages, and how your project differs or improves upon them.",
                        behaviors: [{ name: 'research analyst', type: 'persona' }],
                        guidelines: ['Review at least 3 similar systems', 'Create comparison table', 'Analyze strengths and weaknesses', 'Highlight where your project excels', 'Be objective and fair', 'Cite sources properly'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 75, wordCount: '800', outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    },
                    { 
                        title: "Technology Review", 
                        type: "report", 
                        prompt: "Review the key technologies, frameworks, and tools relevant to your project. Explain your technology choices and justify them.",
                        behaviors: [{ name: 'technology consultant', type: 'persona' }],
                        guidelines: ['Review relevant technologies', 'Compare alternatives', 'Justify technology choices', 'Discuss pros and cons', 'Consider scalability and maintainability'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 75, wordCount: '600' }
                    }
                ]
            },
            {
                title: "Chapter 3: System Design",
                sections: [
                    { 
                        title: "System Architecture", 
                        type: "report", 
                        prompt: "Describe the overall system architecture. Include architecture diagrams, explain component interactions, and justify design decisions.",
                        behaviors: [{ name: 'system architect', type: 'persona' }],
                        guidelines: ['Describe high-level architecture', 'Show component diagrams', 'Explain interactions between components', 'Justify design patterns used', 'Address scalability and performance'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', complexity: 85, outputStyle: { ...defaultControls.outputStyle, diagram: true, paragraph: true } }
                    },
                    { 
                        title: "Database Design", 
                        type: "report", 
                        prompt: "Present the database schema with Entity-Relationship Diagrams. Explain table structures, relationships, and normalization decisions.",
                        behaviors: [{ name: 'database architect', type: 'persona' }],
                        guidelines: ['Include ER diagram', 'Document all entities and relationships', 'Explain normalization level', 'Show key constraints', 'Justify design choices'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, diagram: true, table: true } }
                    },
                    { 
                        title: "Interface Design", 
                        type: "report", 
                        prompt: "Present user interface designs, wireframes, or mockups. Explain design decisions focusing on usability and user experience.",
                        behaviors: [{ name: 'UX designer', type: 'persona' }],
                        guidelines: ['Include UI mockups or wireframes', 'Explain design decisions', 'Focus on usability', 'Describe user flows', 'Address accessibility if applicable'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', complexity: 70 }
                    }
                ]
            },
            {
                title: "Chapter 4: System Implementation",
                sections: [
                    { 
                        title: "Development Environment", 
                        type: "report", 
                        prompt: "Describe the development environment, tools, frameworks, and libraries used. Include versions and setup instructions.",
                        behaviors: [{ name: 'software engineer', type: 'persona' }],
                        guidelines: ['List all development tools', 'Specify versions', 'Describe development workflow', 'Mention version control', 'Include setup requirements'],
                        controls: { ...defaultControls, formality: 75, tone: 'technical', complexity: 65, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    { 
                        title: "Algorithm Implementation", 
                        type: "report", 
                        prompt: "Provide the core algorithms used in the project. Explain the logic, include pseudocode or actual code with comments, and analyze complexity.",
                        behaviors: [{ name: 'software engineer', type: 'persona' }],
                        guidelines: ['Explain algorithm logic clearly', 'Include well-commented code', 'Use appropriate language (Python/C++/Java)', 'Analyze time and space complexity', 'Justify algorithm choice'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 80, programmingLanguage: "python", outputStyle: { ...defaultControls.outputStyle, code: true, paragraph: true } }
                    },
                    { 
                        title: "Key Modules", 
                        type: "report", 
                        prompt: "Describe the implementation of key system modules. Explain functionality, code structure, and integration points.",
                        behaviors: [{ name: 'software engineer', type: 'persona' }],
                        guidelines: ['Describe each major module', 'Explain module responsibilities', 'Show code structure', 'Describe integration', 'Include code snippets'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, code: true, heading: true } }
                    }
                ]
            },
            {
                title: "Chapter 5: Testing & Validation",
                sections: [
                    { 
                        title: "Testing Strategy", 
                        type: "report", 
                        prompt: "Describe your testing approach: unit testing, integration testing, system testing, and user acceptance testing.",
                        behaviors: [{ name: 'QA engineer', type: 'persona' }],
                        guidelines: ['Describe testing levels', 'Explain test coverage', 'List testing tools used', 'Describe test environment', 'Mention automated vs manual testing'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 75 }
                    },
                    { 
                        title: "Test Cases & Results", 
                        type: "report", 
                        prompt: "Present test cases systematically with input, expected output, actual output, and pass/fail status. Include test metrics.",
                        behaviors: [{ name: 'QA engineer', type: 'persona' }],
                        guidelines: ['Use systematic format', 'Include test case table', 'Show pass/fail results', 'Report test coverage metrics', 'Document bugs found and fixed'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', complexity: 70, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    { 
                        title: "Performance Evaluation", 
                        type: "report", 
                        prompt: "Evaluate system performance with benchmarks, response times, resource usage, and scalability metrics.",
                        behaviors: [{ name: 'performance engineer', type: 'persona' }],
                        guidelines: ['Present performance metrics', 'Include benchmark results', 'Measure response times', 'Analyze resource usage', 'Test scalability', 'Use graphs and charts'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    }
                ]
            },
            {
                title: "Chapter 6: Results & Discussion",
                sections: [
                    { 
                        title: "Project Outcomes", 
                        type: "report", 
                        prompt: "Present the final project outcomes, deliverables achieved, and how objectives were met. Show screenshots or demos.",
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['List all deliverables', 'Show how objectives were met', 'Include screenshots or demo results', 'Highlight key achievements', 'Be objective'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', complexity: 70, wordCount: '600' }
                    },
                    { 
                        title: "Challenges & Solutions", 
                        type: "report", 
                        prompt: "Discuss major challenges encountered during development and how they were overcome. Reflect on lessons learned.",
                        behaviors: [{ name: 'software engineer', type: 'persona' }],
                        guidelines: ['Identify major challenges', 'Explain solutions implemented', 'Reflect on what worked', 'Discuss lessons learned', 'Be honest and thoughtful'],
                        controls: { ...defaultControls, formality: 75, tone: 'casual', complexity: 70, wordCount: '500' }
                    }
                ]
            },
            {
                title: "Chapter 7: Conclusion & Future Work",
                sections: [
                    { 
                        title: "Conclusion", 
                        type: "report", 
                        prompt: "Summarize the project achievements, how objectives were met, and the overall contribution of the work.",
                        behaviors: [{ name: 'technical writer', type: 'persona' }],
                        guidelines: ['Summarize key achievements', 'Restate how objectives were met', 'Highlight main contributions', 'Keep it concise', 'End with strong statement'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', wordCount: '400' }
                    },
                    { 
                        title: "Future Enhancements", 
                        type: "report", 
                        prompt: "Suggest concrete future enhancements, additional features, scalability improvements, and research directions.",
                        behaviors: [{ name: 'innovation consultant', type: 'persona' }],
                        guidelines: ['List concrete enhancements', 'Suggest scalability improvements', 'Identify new features', 'Propose research directions', 'Be realistic and specific'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', wordCount: '350', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: "References & Appendices",
                sections: [
                    { 
                        title: "References", 
                        type: "report", 
                        prompt: "List all references in IEEE format. Include academic papers, documentation, and online resources.",
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Use IEEE citation style', 'Include all cited sources', 'Alphabetize by author', 'Include URLs and access dates for web sources', 'Ensure completeness'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'IEEE' }
                    },
                    { 
                        title: "Appendices", 
                        type: "report", 
                        prompt: "Include supplementary material: full code listings, additional diagrams, user manuals, or data tables.",
                        behaviors: [{ name: 'technical editor', type: 'persona' }],
                        guidelines: ['Label clearly (Appendix A, B, C)', 'Include code listings if needed', 'Add user manuals', 'Include additional diagrams', 'Reference in main text'],
                        controls: { ...defaultControls, formality: 75, outputStyle: { ...defaultControls.outputStyle, code: true } }
                    }
                ]
            }
        ]
    },
    {
        id: 'masters-thesis',
        name: "Master's Thesis",
        description: "Comprehensive template for master's degree thesis following academic standards.",
        projectType: "Master's Thesis",
        educationalLevel: 'Graduate',
        content: [
            {
                title: "Front Matter",
                sections: [
                    {
                        title: "Abstract",
                        type: "report",
                        prompt: "Write a comprehensive abstract for a master's thesis. Include: research background, problem statement, methodology, key findings, and conclusions. Keep it to 300-350 words.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Follow academic standards', 'Include all IMRaD components', 'Be concise yet comprehensive', 'Highlight original contributions', 'Write in past tense'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '300' }
                    },
                    {
                        title: "Dedication",
                        type: "report",
                        prompt: "Write a heartfelt dedication section for the thesis. Keep it personal yet formal.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Keep it brief', 'Be sincere and personal', 'Maintain appropriate formality', 'Typically one paragraph'],
                        controls: { ...defaultControls, formality: 80, tone: 'casual', wordCount: '100' }
                    },
                    {
                        title: "Acknowledgments",
                        type: "report",
                        prompt: "Write comprehensive acknowledgments thanking supervisors, committee members, family, friends, and funding sources.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Thank supervisor first', 'Acknowledge committee members', 'Mention funding sources', 'Thank family and friends', 'Be gracious and specific'],
                        controls: { ...defaultControls, formality: 85, tone: 'casual', wordCount: '300' }
                    }
                ]
            },
            {
                title: "Chapter 1: Introduction",
                sections: [
                    {
                        title: "Background and Context",
                        type: "report",
                        prompt: "Provide comprehensive background and context for the research. Explain the broader field and situate your research within it.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Start broad, narrow down', 'Establish context', 'Review key concepts', 'Identify importance', 'Lead to problem statement'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '800' }
                    },
                    {
                        title: "Problem Statement",
                        type: "report",
                        prompt: "Clearly articulate the research problem. Explain why it matters and why existing solutions are inadequate.",
                        behaviors: [{ name: 'research analyst', type: 'persona' }],
                        guidelines: ['Define the problem clearly', 'Explain significance', 'Show gap in knowledge', 'Be specific and focused', 'Justify research need'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '500' }
                    },
                    {
                        title: "Research Questions/Hypotheses",
                        type: "report",
                        prompt: "State clear research questions or hypotheses. Make them specific, measurable, and researchable.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Be specific and clear', 'Make questions researchable', 'Align with problem statement', 'Use appropriate format (RQ or H)', 'Number questions clearly'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: "Research Objectives",
                        type: "report",
                        prompt: "List specific research objectives that address the research questions. Use SMART criteria.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Use SMART criteria', 'List 3-5 objectives', 'Align with research questions', 'Use action verbs', 'Be measurable'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: "Significance of the Study",
                        type: "report",
                        prompt: "Explain the theoretical and practical significance of the research. Describe expected contributions to the field.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Explain theoretical contributions', 'Describe practical implications', 'Identify beneficiaries', 'Be realistic yet impactful', 'Connect to broader field'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 75, wordCount: '400' }
                    },
                    {
                        title: "Scope and Limitations",
                        type: "report",
                        prompt: "Define the scope and acknowledge limitations of the research. Be honest and realistic.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Define scope clearly', 'Acknowledge limitations honestly', 'Explain boundaries', 'Discuss constraints', 'Maintain credibility'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 70 }
                    }
                ]
            },
            {
                title: "Chapter 2: Literature Review",
                sections: [
                    {
                        title: "Theoretical Framework",
                        type: "report",
                        prompt: "Present the theoretical framework underpinning the research. Explain key theories and concepts.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Explain relevant theories', 'Define key concepts', 'Show relationships', 'Justify framework choice', 'Be comprehensive'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '1000' }
                    },
                    {
                        title: "Review of Related Studies",
                        type: "report",
                        prompt: "Conduct a comprehensive review of related studies. Organize thematically or chronologically. Identify trends, gaps, and contradictions.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Organize systematically', 'Analyze critically', 'Compare studies', 'Identify trends and gaps', 'Synthesize findings', 'Cite extensively'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '2500', citationStyle: 'APA7' }
                    },
                    {
                        title: "Research Gap Analysis",
                        type: "report",
                        prompt: "Explicitly identify the research gap that your study addresses. Justify why this gap needs to be filled.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Identify gap clearly', 'Explain why it matters', 'Connect to your research', 'Be specific', 'Justify research contribution'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '500' }
                    },
                    {
                        title: "Conceptual Framework",
                        type: "report",
                        prompt: "Develop and present the conceptual framework for your study. Show relationships between variables or concepts.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Define all variables/concepts', 'Show relationships clearly', 'Include conceptual diagram', 'Explain framework logic', 'Align with research questions'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85, outputStyle: { ...defaultControls.outputStyle, diagram: true } }
                    }
                ]
            },
            {
                title: "Chapter 3: Research Methodology",
                sections: [
                    {
                        title: "Research Design",
                        type: "report",
                        prompt: "Describe the overall research design. Explain whether it's qualitative, quantitative, or mixed methods, and justify this choice.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Describe research approach', 'Justify design choice', 'Explain research paradigm', 'Discuss strategy', 'Be detailed'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 80, wordCount: '600' }
                    },
                    {
                        title: "Population and Sampling",
                        type: "report",
                        prompt: "Define the target population and explain the sampling strategy. Justify sample size and selection criteria.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Define population clearly', 'Explain sampling method', 'Justify sample size', 'Describe selection criteria', 'Address representativeness'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 75, wordCount: '500' }
                    },
                    {
                        title: "Data Collection Methods",
                        type: "report",
                        prompt: "Describe data collection methods in detail. Include instruments, procedures, and pilot testing.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Describe all instruments', 'Explain procedures step-by-step', 'Discuss pilot testing', 'Ensure replicability', 'Address validity'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 80, wordCount: '800' }
                    },
                    {
                        title: "Data Analysis Techniques",
                        type: "report",
                        prompt: "Explain data analysis techniques and statistical methods. Justify choices and describe procedures.",
                        behaviors: [{ name: 'statistician', type: 'persona' }],
                        guidelines: ['Describe analysis methods', 'Explain statistical tests', 'Justify technique choices', 'Mention software used', 'Ensure transparency'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 85, wordCount: '700' }
                    },
                    {
                        title: "Validity and Reliability",
                        type: "report",
                        prompt: "Address validity and reliability of the research. Explain measures taken to ensure research quality.",
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Discuss validity types', 'Address reliability', 'Explain quality measures', 'Discuss threats', 'Be thorough'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '500' }
                    },
                    {
                        title: "Ethical Considerations",
                        type: "report",
                        prompt: "Discuss ethical considerations and approvals obtained. Address informed consent, confidentiality, and other ethical issues.",
                        behaviors: [{ name: 'research ethicist', type: 'persona' }],
                        guidelines: ['Address all ethical issues', 'Mention IRB approval', 'Discuss informed consent', 'Address confidentiality', 'Be comprehensive'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 75 }
                    }
                ]
            },
            {
                title: "Chapter 4: Results and Findings",
                sections: [
                    {
                        title: "Descriptive Statistics",
                        type: "report",
                        prompt: "Present descriptive statistics of the data. Use tables and figures to summarize demographic and key variables.",
                        behaviors: [{ name: 'statistician', type: 'persona' }],
                        guidelines: ['Present systematically', 'Use tables effectively', 'Include all relevant statistics', 'Be clear and organized', 'Describe patterns'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: "Inferential Analysis",
                        type: "report",
                        prompt: "Present inferential statistical analysis. Report test statistics, p-values, effect sizes, and confidence intervals.",
                        behaviors: [{ name: 'statistician', type: 'persona' }],
                        guidelines: ['Report all statistics', 'Include p-values', 'Report effect sizes', 'Use proper notation', 'Be precise', 'Use tables'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true, math: true } }
                    },
                    {
                        title: "Research Questions/Hypotheses Testing",
                        type: "report",
                        prompt: "Address each research question or test each hypothesis systematically. Present findings clearly.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Address each RQ/H', 'Present findings clearly', 'Use evidence', 'Be objective', 'Organize systematically'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80, wordCount: '1200' }
                    },
                    {
                        title: "Additional Findings",
                        type: "report",
                        prompt: "Report any additional or unexpected findings. Even if not directly related to research questions, significant findings should be reported.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Report unexpected findings', 'Be objective', 'Provide context', 'Use appropriate detail'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 75 }
                    }
                ]
            },
            {
                title: "Chapter 5: Discussion",
                sections: [
                    {
                        title: "Interpretation of Results",
                        type: "report",
                        prompt: "Interpret the results in the context of research questions and literature. Explain what the findings mean.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Interpret thoroughly', 'Connect to RQs', 'Relate to literature', 'Explain mechanisms', 'Be insightful'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85, wordCount: '1500' }
                    },
                    {
                        title: "Comparison with Previous Studies",
                        type: "report",
                        prompt: "Compare findings with previous research. Discuss agreements, contradictions, and unique contributions.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Compare systematically', 'Discuss agreements', 'Explain contradictions', 'Highlight contributions', 'Be balanced'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85, wordCount: '1000' }
                    },
                    {
                        title: "Theoretical Implications",
                        type: "report",
                        prompt: "Discuss theoretical implications of the findings. How do they contribute to theory development or refinement?",
                        behaviors: [{ name: 'academic theorist', type: 'persona' }],
                        guidelines: ['Discuss theoretical contributions', 'Explain implications', 'Connect to framework', 'Be scholarly', 'Advance theory'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '700' }
                    },
                    {
                        title: "Practical Implications",
                        type: "report",
                        prompt: "Discuss practical implications for practitioners, policymakers, or other stakeholders.",
                        behaviors: [{ name: 'applied researcher', type: 'persona' }],
                        guidelines: ['Discuss practical applications', 'Identify stakeholders', 'Provide recommendations', 'Be realistic', 'Show value'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 75, wordCount: '700' }
                    },
                    {
                        title: "Study Limitations",
                        type: "report",
                        prompt: "Honestly acknowledge limitations of the study. Explain their potential impact on findings.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Be honest', 'Identify all limitations', 'Explain impact', 'Maintain credibility', 'Avoid over-apologizing'],
                        controls: { ...defaultControls, formality: 90, tone: 'casual', complexity: 75, wordCount: '500' }
                    }
                ]
            },
            {
                title: "Chapter 6: Conclusion and Recommendations",
                sections: [
                    {
                        title: "Summary of Findings",
                        type: "report",
                        prompt: "Summarize the main findings of the research concisely. Restate how research questions were answered.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Summarize key findings', 'Answer RQs explicitly', 'Be concise', 'Avoid new information', 'Maintain coherence'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', wordCount: '500' }
                    },
                    {
                        title: "Conclusions",
                        type: "report",
                        prompt: "Draw conclusions based on the findings. Make definitive statements about what the research has demonstrated.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Draw clear conclusions', 'Be definitive', 'Stay within evidence', 'Highlight contributions', 'End strongly'],
                        controls: { ...defaultControls, formality: 90, tone: 'persuasive', complexity: 80, wordCount: '600' }
                    },
                    {
                        title: "Recommendations for Practice",
                        type: "report",
                        prompt: "Provide specific, actionable recommendations for practitioners based on the findings.",
                        behaviors: [{ name: 'applied researcher', type: 'persona' }],
                        guidelines: ['Be specific', 'Make actionable', 'Base on findings', 'Identify audience', 'Prioritize recommendations'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: "Recommendations for Future Research",
                        type: "report",
                        prompt: "Suggest directions for future research. Build on current study and address limitations.",
                        behaviors: [{ name: 'academic researcher', type: 'persona' }],
                        guidelines: ['Suggest concrete directions', 'Build on current study', 'Address limitations', 'Be forward-thinking', 'Inspire future researchers'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: "References",
                sections: [
                    {
                        title: "References",
                        type: "report",
                        prompt: "Compile complete reference list in APA 7th edition format. Include all cited sources.",
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Use APA 7th edition', 'Include all citations', 'Alphabetize properly', 'Format consistently', 'Include DOIs', 'Double-check accuracy'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    }
                ]
            },
            {
                title: "Appendices",
                sections: [
                    {
                        title: "Appendices",
                        type: "report",
                        prompt: "Include all supplementary materials: questionnaires, interview protocols, raw data tables, additional analyses, etc.",
                        behaviors: [{ name: 'research assistant', type: 'persona' }],
                        guidelines: ['Label clearly (Appendix A, B, C)', 'Include all instruments', 'Add raw data if appropriate', 'Reference in main text', 'Organize systematically'],
                        controls: { ...defaultControls, formality: 85 }
                    }
                ]
            }
        ]
    },
    {
        id: 'lab-report',
        name: 'Lab Report',
        description: 'Standard template for laboratory experiment reports in science and engineering courses.',
        projectType: 'Lab Report',
        educationalLevel: 'Undergraduate',
        content: [
            {
                title: 'Header Information',
                sections: [
                    {
                        title: 'Title and Author Information',
                        type: 'report',
                        prompt: 'Create the header section including: experiment title, student name(s), course name/number, instructor name, lab section, and date.',
                        behaviors: [{ name: 'lab assistant', type: 'persona' }],
                        guidelines: ['Include all required information', 'Format professionally', 'Use proper spacing', 'Be clear and organized'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional' }
                    }
                ]
            },
            {
                title: 'Abstract',
                sections: [
                    {
                        title: 'Abstract',
                        type: 'report',
                        prompt: 'Write a concise abstract summarizing the experiment purpose, methods, key results, and main conclusions in 150-200 words.',
                        behaviors: [{ name: 'research scientist', type: 'persona' }],
                        guidelines: ['Keep to 150-200 words', 'Summarize purpose and objectives', 'Briefly mention methodology', 'State key results quantitatively', 'Conclude with main finding', 'Write in past tense'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 70, wordCount: '150' }
                    }
                ]
            },
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Background Theory',
                        type: 'report',
                        prompt: 'Explain the theoretical background and scientific principles underlying the experiment. Include relevant equations and concepts.',
                        behaviors: [{ name: 'science educator', type: 'persona' }],
                        guidelines: ['Explain relevant theory', 'Include key equations', 'Define important terms', 'Cite textbooks or references', 'Connect theory to experiment'],
                        controls: { ...defaultControls, formality: 85, tone: 'explanatory', complexity: 75, wordCount: '400', outputStyle: { ...defaultControls.outputStyle, math: true } }
                    },
                    {
                        title: 'Objectives',
                        type: 'report',
                        prompt: 'State the specific objectives of the experiment. What are you trying to measure, verify, or determine?',
                        behaviors: [{ name: 'lab instructor', type: 'persona' }],
                        guidelines: ['List 2-4 clear objectives', 'Be specific and measurable', 'Use appropriate verbs (measure, determine, verify)', 'Make objectives testable'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: 'Materials and Methods',
                sections: [
                    {
                        title: 'Equipment and Materials',
                        type: 'report',
                        prompt: 'List all equipment, instruments, materials, and chemicals used in the experiment. Include model numbers and specifications where relevant.',
                        behaviors: [{ name: 'lab technician', type: 'persona' }],
                        guidelines: ['List all equipment used', 'Include model numbers/specifications', 'Mention chemicals with concentrations', 'Organize logically', 'Be complete'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Experimental Procedure',
                        type: 'report',
                        prompt: 'Describe the experimental procedure step-by-step in sufficient detail for replication. Write in past tense and passive voice.',
                        behaviors: [{ name: 'research scientist', type: 'persona' }],
                        guidelines: ['Write in past tense', 'Use numbered steps', 'Provide enough detail for replication', 'Include specific measurements', 'Mention calibration if applicable', 'Note any deviations from standard procedure'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', complexity: 70, wordCount: '500', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Safety Considerations',
                        type: 'report',
                        prompt: 'Describe safety precautions taken during the experiment, including PPE used and hazard mitigation.',
                        behaviors: [{ name: 'safety officer', type: 'persona' }],
                        guidelines: ['List safety equipment used', 'Mention hazards', 'Describe precautions', 'Note disposal procedures', 'Be thorough'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional' }
                    }
                ]
            },
            {
                title: 'Results',
                sections: [
                    {
                        title: 'Data and Observations',
                        type: 'report',
                        prompt: 'Present all experimental data in organized tables. Include raw data, calculated values, and units. Add graphs or figures to visualize trends.',
                        behaviors: [{ name: 'data analyst', type: 'persona' }],
                        guidelines: ['Organize data in clear tables', 'Include all measurements', 'Specify units for all values', 'Number tables and figures', 'Add descriptive captions', 'Show calculations for derived values', 'Report uncertainties'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    },
                    {
                        title: 'Calculations',
                        type: 'report',
                        prompt: 'Show sample calculations for any derived quantities. Include formulas used and propagation of uncertainties.',
                        behaviors: [{ name: 'physics instructor', type: 'persona' }],
                        guidelines: ['Show formulas clearly', 'Include one sample calculation', 'Show unit conversions', 'Calculate uncertainties', 'Use proper significant figures'],
                        controls: { ...defaultControls, formality: 85, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, math: true, code: true } }
                    }
                ]
            },
            {
                title: 'Discussion',
                sections: [
                    {
                        title: 'Analysis of Results',
                        type: 'report',
                        prompt: 'Interpret and analyze the results. Compare experimental values with theoretical or literature values. Calculate percent errors.',
                        behaviors: [{ name: 'research scientist', type: 'persona' }],
                        guidelines: ['Interpret what results mean', 'Compare with expected/theoretical values', 'Calculate percent error', 'Discuss trends or patterns', 'Relate to objectives', 'Be objective'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 75, wordCount: '500' }
                    },
                    {
                        title: 'Sources of Error',
                        type: 'report',
                        prompt: 'Identify and discuss sources of experimental error. Distinguish between random and systematic errors. Suggest improvements.',
                        behaviors: [{ name: 'experimental physicist', type: 'persona' }],
                        guidelines: ['Identify specific error sources', 'Distinguish random vs systematic errors', 'Quantify impact if possible', 'Avoid vague statements', 'Suggest specific improvements', 'Be honest and realistic'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Conclusion',
                sections: [
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: 'Summarize the experiment and state whether objectives were met. Report key findings and their significance.',
                        behaviors: [{ name: 'research scientist', type: 'persona' }],
                        guidelines: ['Restate objectives briefly', 'Summarize key results', 'State whether objectives were met', 'Note significant findings', 'Keep it concise', 'Write in past tense'],
                        controls: { ...defaultControls, formality: 85, tone: 'persuasive', wordCount: '200' }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References',
                        type: 'report',
                        prompt: 'List all references cited in the report including lab manuals, textbooks, and journal articles.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Use consistent citation style', 'Include lab manual', 'Cite textbooks used', 'Format properly', 'Alphabetize'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', citationStyle: 'IEEE' }
                    }
                ]
            },
            {
                title: 'Appendices',
                sections: [
                    {
                        title: 'Appendices',
                        type: 'report',
                        prompt: 'Include supplementary materials such as raw data sheets, detailed calculations, or additional graphs.',
                        behaviors: [{ name: 'lab assistant', type: 'persona' }],
                        guidelines: ['Label clearly (Appendix A, B, etc.)', 'Include raw data if not in main report', 'Add extra calculations', 'Reference in main text'],
                        controls: { ...defaultControls, formality: 75 }
                    }
                ]
            }
        ]
    },
    {
        id: 'case-study',
        name: 'Case Study',
        description: 'Comprehensive template for business, medical, or educational case study analysis.',
        projectType: 'Case Study',
        educationalLevel: 'Professional',
        content: [
            {
                title: 'Executive Summary',
                sections: [
                    {
                        title: 'Executive Summary',
                        type: 'report',
                        prompt: 'Write a concise executive summary highlighting the case, problem, solution, and key outcomes. Keep it to one page.',
                        behaviors: [{ name: 'business analyst', type: 'persona' }],
                        guidelines: ['Summarize the entire case', 'Highlight the problem', 'Mention solution briefly', 'State key outcomes', 'Keep to one page', 'Make it stand-alone'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', complexity: 65, wordCount: '300' }
                    }
                ]
            },
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Background Information',
                        type: 'report',
                        prompt: 'Provide background information about the organization, industry context, and why this case is significant.',
                        behaviors: [{ name: 'case study researcher', type: 'persona' }],
                        guidelines: ['Describe organization/context', 'Explain industry background', 'Set the scene', 'Establish relevance', 'Provide necessary context'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 65, wordCount: '400' }
                    },
                    {
                        title: 'Case Study Objectives',
                        type: 'report',
                        prompt: 'State the objectives of this case study. What questions will it address? What can readers learn?',
                        behaviors: [{ name: 'case study researcher', type: 'persona' }],
                        guidelines: ['State clear objectives', 'List key questions to address', 'Explain learning outcomes', 'Make objectives specific'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Methodology',
                        type: 'report',
                        prompt: 'Describe the methodology used to gather information for this case study (interviews, observations, document analysis, etc.).',
                        behaviors: [{ name: 'qualitative researcher', type: 'persona' }],
                        guidelines: ['Describe data collection methods', 'Mention sources of information', 'Explain analysis approach', 'Address validity', 'Note timeframe'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 70 }
                    }
                ]
            },
            {
                title: 'Case Description',
                sections: [
                    {
                        title: 'Organization/Context Overview',
                        type: 'report',
                        prompt: 'Provide detailed description of the organization, including size, structure, products/services, and market position.',
                        behaviors: [{ name: 'business analyst', type: 'persona' }],
                        guidelines: ['Describe organization comprehensively', 'Include relevant statistics', 'Explain organizational structure', 'Describe products/services', 'Discuss market position'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 70, wordCount: '500' }
                    },
                    {
                        title: 'Key Stakeholders',
                        type: 'report',
                        prompt: 'Identify and describe key stakeholders involved in the case, including their roles, interests, and influence.',
                        behaviors: [{ name: 'stakeholder analyst', type: 'persona' }],
                        guidelines: ['Identify all key stakeholders', 'Describe their roles', 'Explain their interests', 'Discuss their influence', 'Show relationships'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 70, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Situation Analysis',
                        type: 'report',
                        prompt: 'Analyze the situation before the problem emerged. Describe the environment, processes, and relevant factors.',
                        behaviors: [{ name: 'systems analyst', type: 'persona' }],
                        guidelines: ['Describe initial situation', 'Analyze environment', 'Identify relevant factors', 'Establish baseline', 'Be comprehensive'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 75, wordCount: '600' }
                    }
                ]
            },
            {
                title: 'Problem Identification',
                sections: [
                    {
                        title: 'Problem Statement',
                        type: 'report',
                        prompt: 'Clearly define the core problem or challenge faced. Be specific about what went wrong or what needed to change.',
                        behaviors: [{ name: 'problem analyst', type: 'persona' }],
                        guidelines: ['Define problem clearly', 'Be specific', 'Provide evidence', 'Quantify impact if possible', 'Avoid ambiguity'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, wordCount: '400' }
                    },
                    {
                        title: 'Root Cause Analysis',
                        type: 'report',
                        prompt: 'Conduct root cause analysis to identify underlying causes of the problem. Use analytical frameworks if appropriate.',
                        behaviors: [{ name: 'root cause analyst', type: 'persona' }],
                        guidelines: ['Identify root causes', 'Use analytical frameworks (5 Whys, Fishbone)', 'Distinguish symptoms from causes', 'Provide evidence', 'Be thorough'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 80, wordCount: '600', outputStyle: { ...defaultControls.outputStyle, diagram: true } }
                    },
                    {
                        title: 'Impact Assessment',
                        type: 'report',
                        prompt: 'Assess the impact of the problem on the organization, stakeholders, and operations. Quantify where possible.',
                        behaviors: [{ name: 'impact analyst', type: 'persona' }],
                        guidelines: ['Quantify impact', 'Assess multiple dimensions', 'Consider all stakeholders', 'Use metrics', 'Be objective'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Solution Implementation',
                sections: [
                    {
                        title: 'Alternative Solutions Considered',
                        type: 'report',
                        prompt: 'Describe alternative solutions that were considered. Evaluate pros and cons of each option.',
                        behaviors: [{ name: 'strategic consultant', type: 'persona' }],
                        guidelines: ['List alternative solutions', 'Evaluate each option', 'Compare pros and cons', 'Explain selection criteria', 'Be balanced'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Solution Selected',
                        type: 'report',
                        prompt: 'Describe the solution that was selected and explain why it was chosen over alternatives.',
                        behaviors: [{ name: 'decision analyst', type: 'persona' }],
                        guidelines: ['Describe chosen solution', 'Explain selection rationale', 'Justify the choice', 'Address objections', 'Show alignment with objectives'],
                        controls: { ...defaultControls, formality: 75, tone: 'persuasive', complexity: 70, wordCount: '500' }
                    },
                    {
                        title: 'Implementation Process',
                        type: 'report',
                        prompt: 'Describe how the solution was implemented. Include timeline, phases, and key activities.',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Describe implementation steps', 'Include timeline', 'Mention key activities', 'Discuss challenges faced', 'Show how challenges were overcome'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 70, wordCount: '700', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Resources Required',
                        type: 'report',
                        prompt: 'Detail the resources (human, financial, technical) required for implementation.',
                        behaviors: [{ name: 'resource manager', type: 'persona' }],
                        guidelines: ['List all resource types', 'Quantify resources', 'Explain resource allocation', 'Discuss budget', 'Be specific'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Results and Outcomes',
                sections: [
                    {
                        title: 'Quantitative Results',
                        type: 'report',
                        prompt: 'Present quantitative results of the intervention. Use metrics, KPIs, and data to show impact.',
                        behaviors: [{ name: 'data analyst', type: 'persona' }],
                        guidelines: ['Present metrics and KPIs', 'Use before/after comparisons', 'Quantify improvements', 'Use charts and tables', 'Be data-driven'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    },
                    {
                        title: 'Qualitative Outcomes',
                        type: 'report',
                        prompt: 'Describe qualitative outcomes such as employee satisfaction, customer feedback, cultural changes, etc.',
                        behaviors: [{ name: 'qualitative researcher', type: 'persona' }],
                        guidelines: ['Describe qualitative changes', 'Include stakeholder feedback', 'Use quotes if available', 'Discuss intangible benefits', 'Be balanced'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 70, wordCount: '500' }
                    },
                    {
                        title: 'Success Metrics',
                        type: 'report',
                        prompt: 'Evaluate success against predefined metrics and objectives. Discuss extent to which goals were achieved.',
                        behaviors: [{ name: 'performance analyst', type: 'persona' }],
                        guidelines: ['Compare against objectives', 'Evaluate success criteria', 'Be objective', 'Acknowledge shortfalls', 'Quantify achievement'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Analysis and Discussion',
                sections: [
                    {
                        title: 'Critical Analysis',
                        type: 'report',
                        prompt: 'Provide critical analysis of the case. What worked well? What could have been done differently? Apply relevant theories or frameworks.',
                        behaviors: [{ name: 'critical analyst', type: 'persona' }],
                        guidelines: ['Analyze critically', 'Apply theoretical frameworks', 'Discuss what worked', 'Identify what could improve', 'Be balanced and fair', 'Use evidence'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 80, wordCount: '800' }
                    },
                    {
                        title: 'Lessons Learned',
                        type: 'report',
                        prompt: 'Extract key lessons learned from this case. What insights can be applied to similar situations?',
                        behaviors: [{ name: 'learning consultant', type: 'persona' }],
                        guidelines: ['Identify key lessons', 'Make lessons actionable', 'Generalize appropriately', 'Prioritize insights', 'Be specific'],
                        controls: { ...defaultControls, formality: 75, tone: 'casual', complexity: 70, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Best Practices',
                        type: 'report',
                        prompt: 'Identify and document best practices that emerged from this case.',
                        behaviors: [{ name: 'best practice consultant', type: 'persona' }],
                        guidelines: ['Identify best practices', 'Explain why they worked', 'Make them replicable', 'Provide examples', 'Be practical'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: 'Conclusion and Recommendations',
                sections: [
                    {
                        title: 'Key Takeaways',
                        type: 'report',
                        prompt: 'Summarize the key takeaways from this case study. What are the most important points readers should remember?',
                        behaviors: [{ name: 'executive communicator', type: 'persona' }],
                        guidelines: ['List 3-5 key takeaways', 'Be concise', 'Highlight most important points', 'Make memorable', 'Prioritize insights'],
                        controls: { ...defaultControls, formality: 75, tone: 'persuasive', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Recommendations',
                        type: 'report',
                        prompt: 'Provide recommendations for similar organizations or situations. Make them specific and actionable.',
                        behaviors: [{ name: 'strategic consultant', type: 'persona' }],
                        guidelines: ['Make recommendations specific', 'Ensure actionability', 'Prioritize recommendations', 'Base on evidence', 'Consider feasibility'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Transferability',
                        type: 'report',
                        prompt: 'Discuss the extent to which findings and lessons can be transferred to other contexts.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Discuss generalizability', 'Identify similar contexts', 'Note limitations', 'Be realistic', 'Provide guidance'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75 }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References',
                        type: 'report',
                        prompt: 'List all sources, documents, and references used in preparing this case study.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Include all sources', 'Use consistent citation style', 'Format properly', 'Alphabetize', 'Include internal documents if applicable'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', citationStyle: 'APA7' }
                    }
                ]
            },
            {
                title: 'Appendices',
                sections: [
                    {
                        title: 'Appendices',
                        type: 'report',
                        prompt: 'Include supplementary materials such as interview transcripts, additional data, organizational charts, or detailed timelines.',
                        behaviors: [{ name: 'case study researcher', type: 'persona' }],
                        guidelines: ['Label clearly (Appendix A, B, C)', 'Include relevant supplementary materials', 'Reference in main text', 'Organize logically'],
                        controls: { ...defaultControls, formality: 75 }
                    }
                ]
            }
        ]
    },
    {
        id: 'feasibility-study',
        name: 'Feasibility Study',
        description: 'Comprehensive feasibility analysis template for evaluating project viability across multiple dimensions.',
        projectType: 'Feasibility Study',
        educationalLevel: 'Professional',
        content: [
            {
                title: 'Executive Summary',
                sections: [
                    {
                        title: 'Executive Summary',
                        type: 'report',
                        prompt: 'Write an executive summary highlighting the project, feasibility analysis findings, and go/no-go recommendation.',
                        behaviors: [{ name: 'strategic consultant', type: 'persona' }],
                        guidelines: ['Summarize project briefly', 'Highlight key feasibility findings', 'State recommendation clearly', 'Mention critical factors', 'Keep to 1-2 pages'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 70, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Project Background',
                        type: 'report',
                        prompt: 'Provide background on the proposed project, including rationale, context, and why feasibility study is needed.',
                        behaviors: [{ name: 'business analyst', type: 'persona' }],
                        guidelines: ['Explain project concept', 'Provide context', 'State project purpose', 'Explain need for feasibility study', 'Set expectations'],
                        controls: { ...defaultControls, formality: 80, tone: 'explanatory', complexity: 70, wordCount: '500' }
                    },
                    {
                        title: 'Purpose of Feasibility Study',
                        type: 'report',
                        prompt: 'State the specific objectives and scope of this feasibility study.',
                        behaviors: [{ name: 'project analyst', type: 'persona' }],
                        guidelines: ['State study objectives', 'Define scope', 'Identify key questions', 'Mention feasibility dimensions to examine'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Methodology',
                        type: 'report',
                        prompt: 'Describe the methodology used to conduct the feasibility study, including research methods and data sources.',
                        behaviors: [{ name: 'research analyst', type: 'persona' }],
                        guidelines: ['Describe research approach', 'Mention data sources', 'Explain analysis methods', 'Note timeframe', 'Address limitations'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 70 }
                    }
                ]
            },
            {
                title: 'Market Feasibility',
                sections: [
                    {
                        title: 'Market Analysis',
                        type: 'report',
                        prompt: 'Analyze the target market including size, growth trends, segmentation, and characteristics.',
                        behaviors: [{ name: 'market analyst', type: 'persona' }],
                        guidelines: ['Define target market', 'Estimate market size', 'Analyze trends', 'Segment market', 'Use data and statistics'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, wordCount: '700', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Target Market',
                        type: 'report',
                        prompt: 'Define and analyze the specific target customer segments. Include demographics, psychographics, and buying behavior.',
                        behaviors: [{ name: 'market researcher', type: 'persona' }],
                        guidelines: ['Define customer segments', 'Describe characteristics', 'Analyze needs and preferences', 'Estimate segment sizes', 'Prioritize segments'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 70, wordCount: '600' }
                    },
                    {
                        title: 'Competition Analysis',
                        type: 'report',
                        prompt: 'Analyze competitors including their strengths, weaknesses, market share, and strategies.',
                        behaviors: [{ name: 'competitive analyst', type: 'persona' }],
                        guidelines: ['Identify key competitors', 'Analyze their offerings', 'Assess strengths/weaknesses', 'Estimate market shares', 'Identify competitive advantages'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, wordCount: '700', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Market Demand',
                        type: 'report',
                        prompt: 'Assess market demand for the proposed product or service. Include demand projections.',
                        behaviors: [{ name: 'demand analyst', type: 'persona' }],
                        guidelines: ['Assess current demand', 'Project future demand', 'Identify demand drivers', 'Consider seasonality', 'Provide estimates'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Technical Feasibility',
                sections: [
                    {
                        title: 'Technology Requirements',
                        type: 'report',
                        prompt: 'Detail the technology, equipment, and infrastructure required for the project.',
                        behaviors: [{ name: 'technical architect', type: 'persona' }],
                        guidelines: ['Identify technology needs', 'Specify equipment required', 'Describe infrastructure', 'Assess availability', 'Consider scalability'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 75, outputStyle: { ...defaultControls.outputStyle, list: true, table: true } }
                    },
                    {
                        title: 'Technical Resources',
                        type: 'report',
                        prompt: 'Assess availability of technical resources including expertise, facilities, and technology.',
                        behaviors: [{ name: 'resource analyst', type: 'persona' }],
                        guidelines: ['Assess resource availability', 'Identify skill requirements', 'Evaluate facilities', 'Consider procurement', 'Identify gaps'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 70 }
                    },
                    {
                        title: 'Technical Risks',
                        type: 'report',
                        prompt: 'Identify and assess technical risks and challenges. Propose mitigation strategies.',
                        behaviors: [{ name: 'risk analyst', type: 'persona' }],
                        guidelines: ['Identify technical risks', 'Assess probability and impact', 'Propose mitigation strategies', 'Consider contingencies', 'Be realistic'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Solution Architecture',
                        type: 'report',
                        prompt: 'Describe the proposed technical solution architecture at a high level.',
                        behaviors: [{ name: 'solution architect', type: 'persona' }],
                        guidelines: ['Describe architecture', 'Explain key components', 'Show integration points', 'Address scalability', 'Justify choices'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 80, outputStyle: { ...defaultControls.outputStyle, diagram: true } }
                    }
                ]
            },
            {
                title: 'Financial Feasibility',
                sections: [
                    {
                        title: 'Cost Analysis',
                        type: 'report',
                        prompt: 'Provide detailed cost analysis including initial investment, operating costs, and cost breakdown.',
                        behaviors: [{ name: 'financial analyst', type: 'persona' }],
                        guidelines: ['Break down all costs', 'Include one-time and recurring costs', 'Categorize costs', 'Provide cost estimates', 'Show assumptions'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Revenue Projections',
                        type: 'report',
                        prompt: 'Project revenues over a defined period (typically 3-5 years). Include pricing strategy and sales forecasts.',
                        behaviors: [{ name: 'financial analyst', type: 'persona' }],
                        guidelines: ['Project revenues by period', 'Explain pricing strategy', 'Show volume assumptions', 'Consider growth rates', 'Present multiple scenarios'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Break-Even Analysis',
                        type: 'report',
                        prompt: 'Calculate break-even point and analyze time to profitability.',
                        behaviors: [{ name: 'financial analyst', type: 'persona' }],
                        guidelines: ['Calculate break-even point', 'Show calculations', 'Estimate time to break-even', 'Analyze sensitivity', 'Use graphs'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true, math: true } }
                    },
                    {
                        title: 'ROI Calculation',
                        type: 'report',
                        prompt: 'Calculate Return on Investment (ROI), Net Present Value (NPV), and Internal Rate of Return (IRR).',
                        behaviors: [{ name: 'investment analyst', type: 'persona' }],
                        guidelines: ['Calculate ROI', 'Determine NPV', 'Calculate IRR', 'Show formulas', 'Interpret results', 'Consider time value of money'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true, math: true } }
                    },
                    {
                        title: 'Financial Risks',
                        type: 'report',
                        prompt: 'Identify and assess financial risks including funding risks, cost overruns, and revenue shortfalls.',
                        behaviors: [{ name: 'risk analyst', type: 'persona' }],
                        guidelines: ['Identify financial risks', 'Assess impact', 'Quantify where possible', 'Propose mitigation', 'Consider scenarios'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Operational Feasibility',
                sections: [
                    {
                        title: 'Operational Requirements',
                        type: 'report',
                        prompt: 'Define operational requirements including processes, staffing, and day-to-day operations.',
                        behaviors: [{ name: 'operations manager', type: 'persona' }],
                        guidelines: ['Define operational processes', 'Identify staffing needs', 'Describe workflows', 'Consider logistics', 'Address scalability'],
                        controls: { ...defaultControls, formality: 75, tone: 'professional', complexity: 70, wordCount: '600' }
                    },
                    {
                        title: 'Resource Availability',
                        type: 'report',
                        prompt: 'Assess availability of required resources including human resources, facilities, and equipment.',
                        behaviors: [{ name: 'resource planner', type: 'persona' }],
                        guidelines: ['Assess resource needs', 'Evaluate availability', 'Identify gaps', 'Consider recruitment', 'Plan acquisition'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 70, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Organizational Capability',
                        type: 'report',
                        prompt: 'Assess whether the organization has the capability and capacity to execute the project.',
                        behaviors: [{ name: 'organizational consultant', type: 'persona' }],
                        guidelines: ['Assess organizational readiness', 'Evaluate capabilities', 'Identify capability gaps', 'Consider change management', 'Be honest'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, wordCount: '500' }
                    },
                    {
                        title: 'Operational Risks',
                        type: 'report',
                        prompt: 'Identify operational risks and challenges. Propose mitigation strategies.',
                        behaviors: [{ name: 'risk analyst', type: 'persona' }],
                        guidelines: ['Identify operational risks', 'Assess probability and impact', 'Propose mitigation', 'Consider contingencies', 'Be comprehensive'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Legal Feasibility',
                sections: [
                    {
                        title: 'Legal Requirements',
                        type: 'report',
                        prompt: 'Identify legal requirements including permits, licenses, and approvals needed.',
                        behaviors: [{ name: 'legal consultant', type: 'persona' }],
                        guidelines: ['Identify all legal requirements', 'List permits and licenses', 'Note regulatory approvals', 'Consider timeline', 'Assess complexity'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 70, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Regulatory Compliance',
                        type: 'report',
                        prompt: 'Analyze regulatory compliance requirements and assess ability to meet them.',
                        behaviors: [{ name: 'compliance officer', type: 'persona' }],
                        guidelines: ['Identify applicable regulations', 'Assess compliance requirements', 'Evaluate current compliance', 'Identify gaps', 'Plan for compliance'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 75 }
                    },
                    {
                        title: 'Intellectual Property',
                        type: 'report',
                        prompt: 'Address intellectual property considerations including patents, trademarks, and copyrights.',
                        behaviors: [{ name: 'IP specialist', type: 'persona' }],
                        guidelines: ['Identify IP considerations', 'Assess IP protection needs', 'Review existing IP', 'Consider infringement risks', 'Recommend IP strategy'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 75 }
                    },
                    {
                        title: 'Contracts and Agreements',
                        type: 'report',
                        prompt: 'Identify key contracts and agreements required for the project.',
                        behaviors: [{ name: 'legal consultant', type: 'persona' }],
                        guidelines: ['List required contracts', 'Identify parties', 'Note key terms', 'Consider legal risks', 'Plan negotiation strategy'],
                        controls: { ...defaultControls, formality: 85, tone: 'professional', complexity: 70 }
                    }
                ]
            },
            {
                title: 'Risk Analysis',
                sections: [
                    {
                        title: 'Risk Identification',
                        type: 'report',
                        prompt: 'Comprehensively identify all project risks across all feasibility dimensions.',
                        behaviors: [{ name: 'risk manager', type: 'persona' }],
                        guidelines: ['Identify risks systematically', 'Cover all dimensions', 'Be comprehensive', 'Categorize risks', 'Use risk register format'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Risk Assessment',
                        type: 'report',
                        prompt: 'Assess each identified risk for probability and impact. Prioritize risks.',
                        behaviors: [{ name: 'risk analyst', type: 'persona' }],
                        guidelines: ['Assess probability', 'Assess impact', 'Calculate risk scores', 'Prioritize risks', 'Use risk matrix', 'Be objective'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Mitigation Strategies',
                        type: 'report',
                        prompt: 'Propose risk mitigation strategies for high-priority risks.',
                        behaviors: [{ name: 'risk manager', type: 'persona' }],
                        guidelines: ['Propose specific mitigation strategies', 'Assign responsibilities', 'Estimate mitigation costs', 'Develop contingency plans', 'Be practical'],
                        controls: { ...defaultControls, formality: 80, tone: 'technical', complexity: 75, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Conclusion and Recommendations',
                sections: [
                    {
                        title: 'Feasibility Summary',
                        type: 'report',
                        prompt: 'Summarize findings from each feasibility dimension (market, technical, financial, operational, legal).',
                        behaviors: [{ name: 'strategic consultant', type: 'persona' }],
                        guidelines: ['Summarize each dimension', 'Highlight key findings', 'Note critical issues', 'Be balanced', 'Be concise'],
                        controls: { ...defaultControls, formality: 85, tone: 'persuasive', complexity: 75, wordCount: '600' }
                    },
                    {
                        title: 'Go/No-Go Recommendation',
                        type: 'report',
                        prompt: 'Provide clear go/no-go recommendation with supporting rationale. Include conditions if applicable.',
                        behaviors: [{ name: 'executive consultant', type: 'persona' }],
                        guidelines: ['State recommendation clearly', 'Provide strong rationale', 'Cite key factors', 'Include conditions if needed', 'Be decisive', 'Support with data'],
                        controls: { ...defaultControls, formality: 90, tone: 'persuasive', complexity: 75, wordCount: '400' }
                    },
                    {
                        title: 'Next Steps',
                        type: 'report',
                        prompt: 'Outline recommended next steps if proceeding with the project.',
                        behaviors: [{ name: 'project consultant', type: 'persona' }],
                        guidelines: ['Outline specific next steps', 'Provide timeline', 'Identify quick wins', 'Prioritize actions', 'Assign responsibilities'],
                        controls: { ...defaultControls, formality: 80, tone: 'professional', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: 'Appendices',
                sections: [
                    {
                        title: 'Appendices',
                        type: 'report',
                        prompt: 'Include supporting materials such as detailed financial models, market research data, technical specifications, and legal documents.',
                        behaviors: [{ name: 'business analyst', type: 'persona' }],
                        guidelines: ['Label clearly (Appendix A, B, C)', 'Include detailed data', 'Add financial models', 'Include surveys or research', 'Reference in main text'],
                        controls: { ...defaultControls, formality: 80 }
                    }
                ]
            }
        ]
    },
    {
        id: 'high-school-research-paper',
        name: 'High School Research Paper',
        description: 'Simplified research paper template for high school students learning academic writing.',
        projectType: 'Research Paper',
        educationalLevel: 'High School',
        content: [
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Introduction',
                        type: 'report',
                        prompt: 'Write an engaging introduction that introduces your topic, explains why it\'s important, and states your main argument (thesis statement). Make it interesting to hook your reader!',
                        behaviors: [{ name: 'high school teacher', type: 'persona' }],
                        guidelines: ['Start with an interesting hook', 'Give background on your topic', 'Explain why this topic matters', 'End with a clear thesis statement', 'Keep it simple and clear'],
                        controls: { ...defaultControls, formality: 65, tone: 'explanatory', complexity: 50, wordCount: '300' }
                    }
                ]
            },
            {
                title: 'Background Research',
                sections: [
                    {
                        title: 'Background Information',
                        type: 'report',
                        prompt: 'Explain the background information your reader needs to understand your topic. Define key terms and concepts.',
                        behaviors: [{ name: 'educator', type: 'persona' }],
                        guidelines: ['Define important terms', 'Explain key concepts', 'Give historical context if needed', 'Use simple language', 'Cite your sources'],
                        controls: { ...defaultControls, formality: 65, tone: 'explanatory', complexity: 50, wordCount: '400' }
                    },
                    {
                        title: 'What Others Have Found',
                        type: 'report',
                        prompt: 'Summarize what other researchers or experts have said about your topic. Use at least 3-5 credible sources.',
                        behaviors: [{ name: 'research teacher', type: 'persona' }],
                        guidelines: ['Summarize each source clearly', 'Explain how sources relate to your topic', 'Compare different viewpoints', 'Use your own words', 'Always cite sources'],
                        controls: { ...defaultControls, formality: 70, tone: 'explanatory', complexity: 55, wordCount: '500', citationStyle: 'MLA9' }
                    }
                ]
            },
            {
                title: 'Your Research/Analysis',
                sections: [
                    {
                        title: 'Main Arguments',
                        type: 'report',
                        prompt: 'Present your main arguments or findings. Organize into 2-3 main points. Support each point with evidence.',
                        behaviors: [{ name: 'writing coach', type: 'persona' }],
                        guidelines: ['Organize into clear paragraphs', 'Start each paragraph with a topic sentence', 'Support arguments with evidence', 'Explain your reasoning', 'Use transitions between paragraphs'],
                        controls: { ...defaultControls, formality: 65, tone: 'persuasive', complexity: 55, wordCount: '600' }
                    },
                    {
                        title: 'Evidence and Examples',
                        type: 'report',
                        prompt: 'Provide specific evidence, examples, data, or quotes that support your arguments.',
                        behaviors: [{ name: 'research teacher', type: 'persona' }],
                        guidelines: ['Use specific examples', 'Include facts and statistics', 'Add relevant quotes', 'Explain how evidence supports your point', 'Cite all sources'],
                        controls: { ...defaultControls, formality: 70, tone: 'academic', complexity: 55, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Conclusion',
                sections: [
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: 'Wrap up your paper by restating your thesis, summarizing main points, and explaining the significance of your findings.',
                        behaviors: [{ name: 'writing coach', type: 'persona' }],
                        guidelines: ['Restate your thesis in different words', 'Summarize your main points', 'Explain why your research matters', 'End with a strong final thought', 'Don\'t introduce new information'],
                        controls: { ...defaultControls, formality: 65, tone: 'persuasive', complexity: 50, wordCount: '250' }
                    }
                ]
            },
            {
                title: 'Works Cited',
                sections: [
                    {
                        title: 'Works Cited / Bibliography',
                        type: 'report',
                        prompt: 'List all sources you used in MLA format. Include books, websites, articles, and other materials.',
                        behaviors: [{ name: 'librarian', type: 'persona' }],
                        guidelines: ['Use MLA format', 'Alphabetize by author\'s last name', 'Include all sources you cited', 'Double-check formatting', 'Indent second line of each entry'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', citationStyle: 'MLA9' }
                    }
                ]
            }
        ]
    },
    {
        id: 'high-school-science-project',
        name: 'High School Science Project Report',
        description: 'Science fair or lab project report template for high school students.',
        projectType: 'Science Project',
        educationalLevel: 'High School',
        content: [
            {
                title: 'Project Overview',
                sections: [
                    {
                        title: 'Title Page',
                        type: 'report',
                        prompt: 'Create a title page with: project title, your name, teacher name, class, and date. Make the title clear and descriptive.',
                        behaviors: [{ name: 'science teacher', type: 'persona' }],
                        guidelines: ['Make title clear and specific', 'Include all required information', 'Center and format professionally', 'Use proper spacing'],
                        controls: { ...defaultControls, formality: 70, tone: 'professional' }
                    },
                    {
                        title: 'Abstract',
                        type: 'report',
                        prompt: 'Write a brief summary (100-150 words) of your project: what you studied, how you did it, and what you found.',
                        behaviors: [{ name: 'science teacher', type: 'persona' }],
                        guidelines: ['Keep it to 100-150 words', 'State your research question', 'Describe your method briefly', 'Summarize key results', 'State your conclusion', 'Write in past tense'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 55, wordCount: '150' }
                    }
                ]
            },
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Introduction and Research Question',
                        type: 'report',
                        prompt: 'Introduce your topic and state your research question or hypothesis. Explain why this question is interesting or important.',
                        behaviors: [{ name: 'science educator', type: 'persona' }],
                        guidelines: ['Introduce the topic', 'State your research question clearly', 'Or state your hypothesis', 'Explain why it matters', 'Give some background'],
                        controls: { ...defaultControls, formality: 70, tone: 'academic', complexity: 55, wordCount: '300' }
                    },
                    {
                        title: 'Background Research',
                        type: 'report',
                        prompt: 'Explain the science behind your project. What did you learn from books, websites, or articles about your topic?',
                        behaviors: [{ name: 'science teacher', type: 'persona' }],
                        guidelines: ['Explain relevant scientific concepts', 'Summarize what others have learned', 'Define key terms', 'Cite your sources', 'Connect to your project'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 60, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Materials and Methods',
                sections: [
                    {
                        title: 'Materials',
                        type: 'report',
                        prompt: 'List all materials and equipment you used in your experiment.',
                        behaviors: [{ name: 'lab instructor', type: 'persona' }],
                        guidelines: ['List everything you used', 'Be specific (sizes, amounts, brands)', 'Organize the list logically', 'Include quantities'],
                        controls: { ...defaultControls, formality: 75, tone: 'technical', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Procedure',
                        type: 'report',
                        prompt: 'Describe step-by-step what you did in your experiment. Write clearly so someone could repeat your experiment.',
                        behaviors: [{ name: 'lab instructor', type: 'persona' }],
                        guidelines: ['Write in numbered steps', 'Use past tense', 'Be detailed and specific', 'Include measurements', 'Someone should be able to repeat it', 'Mention safety precautions'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 55, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    }
                ]
            },
            {
                title: 'Results',
                sections: [
                    {
                        title: 'Data and Observations',
                        type: 'report',
                        prompt: 'Present your data in tables or graphs. Describe what you observed without explaining why yet.',
                        behaviors: [{ name: 'science teacher', type: 'persona' }],
                        guidelines: ['Show data in tables or graphs', 'Label everything clearly', 'Describe what you saw', 'Be objective - just report facts', 'Include all trials', 'Note any unusual observations'],
                        controls: { ...defaultControls, formality: 75, tone: 'explanatory', complexity: 60, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Discussion and Conclusion',
                sections: [
                    {
                        title: 'Analysis and Discussion',
                        type: 'report',
                        prompt: 'Explain what your results mean. Did they support your hypothesis? Why or why not? What might have affected your results?',
                        behaviors: [{ name: 'science educator', type: 'persona' }],
                        guidelines: ['Explain what results mean', 'Compare to your hypothesis', 'Discuss unexpected results', 'Identify sources of error', 'Connect to background research', 'Be honest about problems'],
                        controls: { ...defaultControls, formality: 70, tone: 'academic', complexity: 60, wordCount: '400' }
                    },
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: 'Summarize what you learned and answer your research question. Suggest improvements or future experiments.',
                        behaviors: [{ name: 'science teacher', type: 'persona' }],
                        guidelines: ['Restate your research question', 'Summarize your findings', 'State whether hypothesis was supported', 'Explain what you learned', 'Suggest future experiments', 'Keep it brief'],
                        controls: { ...defaultControls, formality: 70, tone: 'persuasive', complexity: 55, wordCount: '250' }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References',
                        type: 'report',
                        prompt: 'List all books, websites, and articles you used for background research.',
                        behaviors: [{ name: 'librarian', type: 'persona' }],
                        guidelines: ['List all sources', 'Use consistent format', 'Include author, title, publication date', 'For websites, include URL and access date', 'Alphabetize by author'],
                        controls: { ...defaultControls, formality: 80, tone: 'academic', citationStyle: 'MLA9' }
                    }
                ]
            }
        ]
    },
    {
        id: 'first-year-essay',
        name: 'First Year Undergraduate Essay',
        description: 'Academic essay template for first-year university students developing writing skills.',
        projectType: 'Academic Essay',
        educationalLevel: 'Undergraduate (First Year)',
        content: [
            {
                title: 'Introduction',
                sections: [
                    {
                        title: 'Introduction with Thesis Statement',
                        type: 'report',
                        prompt: 'Write an introduction that provides context, engages the reader, and ends with a clear thesis statement that outlines your argument.',
                        behaviors: [{ name: 'writing instructor', type: 'persona' }],
                        guidelines: ['Start with a hook or context', 'Provide necessary background', 'Narrow to your specific topic', 'End with a clear thesis statement', 'Thesis should be debatable and specific', 'Aim for 200-300 words'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 60, wordCount: '250' }
                    }
                ]
            },
            {
                title: 'Body Paragraphs',
                sections: [
                    {
                        title: 'First Main Point',
                        type: 'report',
                        prompt: 'Develop your first main argument with a clear topic sentence, supporting evidence, analysis, and connection to your thesis.',
                        behaviors: [{ name: 'composition teacher', type: 'persona' }],
                        guidelines: ['Start with a clear topic sentence', 'Present evidence (quotes, data, examples)', 'Analyze and explain the evidence', 'Connect back to thesis', 'Use transitions', 'Aim for 300-400 words'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 65, wordCount: '350' }
                    },
                    {
                        title: 'Second Main Point',
                        type: 'report',
                        prompt: 'Develop your second main argument following the same structure: topic sentence, evidence, analysis, connection to thesis.',
                        behaviors: [{ name: 'composition teacher', type: 'persona' }],
                        guidelines: ['Start with topic sentence', 'Provide different evidence', 'Analyze thoroughly', 'Show progression of argument', 'Use transitions from previous paragraph'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 65, wordCount: '350' }
                    },
                    {
                        title: 'Third Main Point (Optional)',
                        type: 'report',
                        prompt: 'If needed, develop a third main argument or address a counter-argument to strengthen your position.',
                        behaviors: [{ name: 'writing instructor', type: 'persona' }],
                        guidelines: ['Maintain paragraph structure', 'Or present and refute counter-argument', 'Show depth of thinking', 'Keep coherence with previous points'],
                        controls: { ...defaultControls, formality: 75, tone: 'academic', complexity: 65, wordCount: '350' }
                    }
                ]
            },
            {
                title: 'Conclusion',
                sections: [
                    {
                        title: 'Conclusion',
                        type: 'report',
                        prompt: 'Conclude by restating your thesis (in new words), summarizing key points, and explaining the broader significance of your argument.',
                        behaviors: [{ name: 'writing coach', type: 'persona' }],
                        guidelines: ['Restate thesis in fresh words', 'Synthesize main points', 'Explain broader significance', 'End with thought-provoking statement', 'Don\'t introduce new arguments', 'Aim for 150-200 words'],
                        controls: { ...defaultControls, formality: 75, tone: 'persuasive', complexity: 60, wordCount: '200' }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References / Works Cited',
                        type: 'report',
                        prompt: 'List all sources cited in your essay using the required citation style (APA, MLA, or Chicago).',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Follow the required citation style', 'Alphabetize entries', 'Include all in-text citations', 'Use hanging indent', 'Double-check formatting'],
                        controls: { ...defaultControls, formality: 85, tone: 'academic', citationStyle: 'MLA9' }
                    }
                ]
            }
        ]
    },
    {
        id: 'phd-dissertation',
        name: 'PhD Dissertation',
        description: 'Comprehensive doctoral dissertation template following academic standards for original research contribution.',
        projectType: 'PhD Dissertation',
        educationalLevel: 'Doctoral',
        content: [
            {
                title: 'Front Matter',
                sections: [
                    {
                        title: 'Abstract',
                        type: 'report',
                        prompt: 'Write a comprehensive abstract (350-500 words) summarizing the dissertation: research problem, theoretical framework, methodology, key findings, and original contributions.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['State research problem clearly', 'Mention theoretical framework', 'Describe methodology briefly', 'Highlight key findings', 'Emphasize original contributions', 'Keep within word limit', 'Write in past tense'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '400' }
                    },
                    {
                        title: 'Acknowledgments',
                        type: 'report',
                        prompt: 'Write formal acknowledgments thanking supervisors, committee members, funding bodies, colleagues, and family for their support.',
                        behaviors: [{ name: 'doctoral candidate', type: 'persona' }],
                        guidelines: ['Thank doctoral supervisor first', 'Acknowledge committee members', 'Mention funding sources', 'Thank research participants', 'Acknowledge family support', 'Be gracious and specific'],
                        controls: { ...defaultControls, formality: 90, tone: 'casual', wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Chapter 1: Introduction',
                sections: [
                    {
                        title: 'Research Background and Context',
                        type: 'report',
                        prompt: 'Provide comprehensive background establishing the research context, explaining the domain, and situating your work within the broader field.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Establish broad context', 'Narrow to specific domain', 'Explain current state of knowledge', 'Identify tensions or debates', 'Lead to research problem'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1500' }
                    },
                    {
                        title: 'Research Problem',
                        type: 'report',
                        prompt: 'Articulate the research problem clearly. Explain its significance, why existing approaches are inadequate, and why it warrants doctoral-level investigation.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Define problem precisely', 'Explain significance', 'Critique existing approaches', 'Justify doctoral-level study', 'Show complexity', 'Establish urgency'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1000' }
                    },
                    {
                        title: 'Research Questions',
                        type: 'report',
                        prompt: 'State primary research question(s) and subsidiary questions. Ensure they are clear, researchable, and appropriate for doctoral inquiry.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['State main research question', 'List subsidiary questions', 'Ensure questions are researchable', 'Show logical relationships', 'Align with problem statement'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90 }
                    },
                    {
                        title: 'Research Objectives',
                        type: 'report',
                        prompt: 'List specific research objectives that address the research questions. Make them clear, achievable, and measurable.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['List 4-6 objectives', 'Use action verbs', 'Make objectives specific', 'Ensure measurability', 'Align with research questions'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Theoretical Framework',
                        type: 'report',
                        prompt: 'Present the theoretical framework underpinning your research. Explain key theories, concepts, and how they inform your investigation.',
                        behaviors: [{ name: 'theoretical scholar', type: 'persona' }],
                        guidelines: ['Introduce relevant theories', 'Explain theoretical foundations', 'Show how theories inform research', 'Justify framework choice', 'Integrate multiple perspectives if needed'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '1500' }
                    },
                    {
                        title: 'Significance and Original Contribution',
                        type: 'report',
                        prompt: 'Articulate the significance of your research and its original contribution to knowledge. Be explicit about theoretical, methodological, and practical contributions.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['State original contributions explicitly', 'Explain theoretical significance', 'Describe methodological innovations', 'Discuss practical implications', 'Justify doctoral worthiness'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '800' }
                    },
                    {
                        title: 'Scope and Delimitations',
                        type: 'report',
                        prompt: 'Define the scope of your research and acknowledge delimitations. Be clear about boundaries, exclusions, and reasons for them.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Define scope clearly', 'Explain delimitations', 'Justify boundaries', 'Note exclusions', 'Acknowledge limitations'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85 }
                    },
                    {
                        title: 'Dissertation Structure',
                        type: 'report',
                        prompt: 'Provide an overview of the dissertation structure, chapter by chapter, explaining the logic and flow.',
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Overview each chapter', 'Explain logical progression', 'Show connections between chapters', 'Be concise'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 80 }
                    }
                ]
            },
            {
                title: 'Chapter 2: Literature Review',
                sections: [
                    {
                        title: 'Introduction to Literature Review',
                        type: 'report',
                        prompt: 'Introduce the literature review: its purpose, organization, and how it supports your research.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['State purpose of review', 'Explain organization', 'Preview main themes', 'Connect to research questions'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '500' }
                    },
                    {
                        title: 'Historical Development of the Field',
                        type: 'report',
                        prompt: 'Trace the historical development of thought in your research area. Show how understanding has evolved.',
                        behaviors: [{ name: 'scholarly historian', type: 'persona' }],
                        guidelines: ['Trace chronological development', 'Identify key turning points', 'Show evolution of thought', 'Connect to current debates'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '2000' }
                    },
                    {
                        title: 'Critical Review of Literature',
                        type: 'report',
                        prompt: 'Conduct systematic critical review of literature organized thematically. Analyze, synthesize, and critique existing research.',
                        behaviors: [{ name: 'critical scholar', type: 'persona' }],
                        guidelines: ['Organize thematically', 'Critically analyze studies', 'Identify strengths and weaknesses', 'Synthesize findings', 'Show debates and contradictions', 'Be comprehensive'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '5000', citationStyle: 'APA7' }
                    },
                    {
                        title: 'Methodological Review',
                        type: 'report',
                        prompt: 'Review methodological approaches used in existing research. Critique methods and identify methodological gaps.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Review methods systematically', 'Critique methodological choices', 'Identify gaps', 'Justify your methodological approach'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1500' }
                    },
                    {
                        title: 'Research Gaps and Justification',
                        type: 'report',
                        prompt: 'Explicitly identify research gaps that your study addresses. Build case for your research.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Identify specific gaps', 'Explain why gaps matter', 'Show how your research fills gaps', 'Build compelling case', 'Be explicit'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 90, wordCount: '1000' }
                    },
                    {
                        title: 'Conceptual Framework Development',
                        type: 'report',
                        prompt: 'Develop your conceptual framework synthesizing literature. Show relationships between concepts and how framework guides research.',
                        behaviors: [{ name: 'theoretical scholar', type: 'persona' }],
                        guidelines: ['Synthesize from literature', 'Define all concepts', 'Show relationships', 'Include conceptual diagram', 'Explain how it guides research'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '1500', outputStyle: { ...defaultControls.outputStyle, diagram: true } }
                    }
                ]
            },
            {
                title: 'Chapter 3: Research Methodology',
                sections: [
                    {
                        title: 'Philosophical Paradigm',
                        type: 'report',
                        prompt: 'Articulate your philosophical paradigm (ontology, epistemology, axiology). Justify paradigm choice.',
                        behaviors: [{ name: 'philosophy of science scholar', type: 'persona' }],
                        guidelines: ['Explain ontological position', 'Articulate epistemology', 'Discuss axiology', 'Justify paradigm choice', 'Show coherence with methods'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '1500' }
                    },
                    {
                        title: 'Research Design',
                        type: 'report',
                        prompt: 'Describe overall research design in detail. Explain design choice and how it addresses research questions.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Describe design comprehensively', 'Justify design choice', 'Explain how it addresses RQs', 'Discuss design strengths', 'Acknowledge limitations'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1200' }
                    },
                    {
                        title: 'Research Strategy and Approach',
                        type: 'report',
                        prompt: 'Detail research strategy (e.g., case study, ethnography, experiment). Explain approach systematically.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Describe strategy in detail', 'Explain procedural steps', 'Justify choices', 'Show rigor', 'Ensure replicability'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1500' }
                    },
                    {
                        title: 'Data Collection',
                        type: 'report',
                        prompt: 'Describe data collection methods comprehensively. Include instruments, procedures, sampling, and access.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['Describe all methods', 'Explain sampling strategy', 'Detail instruments', 'Describe procedures', 'Discuss access and ethics', 'Ensure replicability'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '2000' }
                    },
                    {
                        title: 'Data Analysis',
                        type: 'report',
                        prompt: 'Explain data analysis approach in detail. Describe analytical frameworks, techniques, and software used.',
                        behaviors: [{ name: 'data analyst', type: 'persona' }],
                        guidelines: ['Describe analytical approach', 'Explain techniques', 'Mention software/tools', 'Show analytical rigor', 'Explain interpretation process'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1500' }
                    },
                    {
                        title: 'Quality Criteria',
                        type: 'report',
                        prompt: 'Address quality criteria (validity, reliability, trustworthiness, credibility) appropriate to your paradigm.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Address appropriate quality criteria', 'Explain measures taken', 'Discuss triangulation', 'Show methodological rigor', 'Be paradigm-appropriate'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1200' }
                    },
                    {
                        title: 'Ethical Considerations',
                        type: 'report',
                        prompt: 'Discuss ethical considerations comprehensively. Include approvals, informed consent, confidentiality, and ethical dilemmas.',
                        behaviors: [{ name: 'research ethics specialist', type: 'persona' }],
                        guidelines: ['Discuss all ethical issues', 'Mention IRB approval', 'Explain informed consent', 'Address confidentiality', 'Discuss ethical dilemmas', 'Show ethical reflexivity'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '1000' }
                    }
                ]
            },
            {
                title: 'Chapters 4-5: Findings (Multiple if needed)',
                sections: [
                    {
                        title: 'Introduction to Findings',
                        type: 'report',
                        prompt: 'Introduce findings chapters. Explain organization and how findings address research questions.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Preview findings organization', 'Connect to research questions', 'Explain chapter structure', 'Set expectations'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '500' }
                    },
                    {
                        title: 'Findings Theme/Study 1',
                        type: 'report',
                        prompt: 'Present first major set of findings systematically. Use evidence, quotes, data to support findings.',
                        behaviors: [{ name: 'qualitative researcher', type: 'persona' }],
                        guidelines: ['Present findings systematically', 'Use evidence extensively', 'Include participant quotes if qualitative', 'Present data clearly', 'Stay descriptive - save interpretation for discussion'],
                        controls: { ...defaultControls, formality: 95, tone: 'explanatory', complexity: 85, wordCount: '3000', outputStyle: { ...defaultControls.outputStyle, table: true, paragraph: true } }
                    },
                    {
                        title: 'Findings Theme/Study 2',
                        type: 'report',
                        prompt: 'Present second major set of findings. Maintain systematic approach.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Follow similar structure', 'Present systematically', 'Use evidence', 'Be comprehensive', 'Show rigor'],
                        controls: { ...defaultControls, formality: 95, tone: 'explanatory', complexity: 85, wordCount: '3000' }
                    }
                ]
            },
            {
                title: 'Chapter 6: Discussion',
                sections: [
                    {
                        title: 'Overview of Key Findings',
                        type: 'report',
                        prompt: 'Summarize key findings before detailed discussion. Show how they address research questions.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Summarize key findings', 'Connect to research questions', 'Preview discussion structure', 'Be concise'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '800' }
                    },
                    {
                        title: 'Interpretation and Analysis',
                        type: 'report',
                        prompt: 'Interpret findings in depth. Analyze meanings, patterns, and implications. Connect to theoretical framework.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Interpret findings thoroughly', 'Analyze patterns and meanings', 'Connect to theoretical framework', 'Show depth of analysis', 'Be insightful'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '3000' }
                    },
                    {
                        title: 'Relation to Existing Literature',
                        type: 'report',
                        prompt: 'Relate findings to existing literature. Show agreements, contradictions, and how your work advances knowledge.',
                        behaviors: [{ name: 'scholarly analyst', type: 'persona' }],
                        guidelines: ['Compare with literature systematically', 'Explain agreements', 'Address contradictions', 'Show advancement of knowledge', 'Be balanced'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '2500' }
                    },
                    {
                        title: 'Theoretical Contributions',
                        type: 'report',
                        prompt: 'Articulate theoretical contributions explicitly. Show how your work advances, refines, or challenges existing theory.',
                        behaviors: [{ name: 'theoretical scholar', type: 'persona' }],
                        guidelines: ['State theoretical contributions explicitly', 'Show theoretical advancement', 'Discuss implications for theory', 'Be scholarly', 'Make original contributions clear'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', complexity: 95, wordCount: '1500' }
                    },
                    {
                        title: 'Methodological Reflections',
                        type: 'report',
                        prompt: 'Reflect on methodological approach. Discuss strengths, challenges, and methodological contributions.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Reflect on methodology critically', 'Discuss strengths', 'Acknowledge challenges', 'Identify methodological contributions', 'Show reflexivity'],
                        controls: { ...defaultControls, formality: 95, tone: 'casual', complexity: 90, wordCount: '1200' }
                    },
                    {
                        title: 'Practical Implications',
                        type: 'report',
                        prompt: 'Discuss practical implications for practice, policy, or application. Be specific about who benefits and how.',
                        behaviors: [{ name: 'applied researcher', type: 'persona' }],
                        guidelines: ['Identify practical implications', 'Be specific about applications', 'Identify beneficiaries', 'Provide recommendations', 'Be realistic'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 85, wordCount: '1500' }
                    },
                    {
                        title: 'Limitations',
                        type: 'report',
                        prompt: 'Acknowledge limitations honestly and comprehensively. Discuss their potential impact on findings.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['Be honest about limitations', 'Discuss all major limitations', 'Explain potential impact', 'Maintain credibility', 'Don\'t over-apologize'],
                        controls: { ...defaultControls, formality: 95, tone: 'casual', complexity: 85, wordCount: '1000' }
                    }
                ]
            },
            {
                title: 'Chapter 7: Conclusion',
                sections: [
                    {
                        title: 'Summary of Research',
                        type: 'report',
                        prompt: 'Summarize the entire research journey: problem, approach, key findings, and contributions.',
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ['Summarize research comprehensively', 'Cover all major aspects', 'Be synthesizing', 'Avoid new information'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 85, wordCount: '1000' }
                    },
                    {
                        title: 'Original Contributions to Knowledge',
                        type: 'report',
                        prompt: 'State original contributions explicitly and clearly. This is your claim to doctoral worthiness.',
                        behaviors: [{ name: 'doctoral researcher', type: 'persona' }],
                        guidelines: ['State contributions explicitly', 'Be clear and specific', 'Distinguish types of contributions', 'Make claims confidently', 'Justify doctoral worthiness'],
                        controls: { ...defaultControls, formality: 100, tone: 'explanatory', complexity: 90, wordCount: '800' }
                    },
                    {
                        title: 'Implications for Research and Practice',
                        type: 'report',
                        prompt: 'Synthesize implications for research and practice. Show broader impact of your work.',
                        behaviors: [{ name: 'scholarly practitioner', type: 'persona' }],
                        guidelines: ['Discuss research implications', 'Address practice implications', 'Show broader impact', 'Be visionary yet realistic'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 85, wordCount: '1000' }
                    },
                    {
                        title: 'Recommendations for Future Research',
                        type: 'report',
                        prompt: 'Provide specific recommendations for future research. Build research agenda extending from your work.',
                        behaviors: [{ name: 'research strategist', type: 'persona' }],
                        guidelines: ['Provide specific recommendations', 'Build from your findings', 'Identify promising directions', 'Inspire future researchers', 'Be visionary'],
                        controls: { ...defaultControls, formality: 95, tone: 'technical', complexity: 85, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Final Reflections',
                        type: 'report',
                        prompt: 'Offer final reflections on your doctoral journey and the significance of your work.',
                        behaviors: [{ name: 'reflective scholar', type: 'persona' }],
                        guidelines: ['Reflect on journey', 'Show personal growth', 'Emphasize significance', 'End powerfully', 'Be inspiring'],
                        controls: { ...defaultControls, formality: 90, tone: 'casual', complexity: 80, wordCount: '500' }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References',
                        type: 'report',
                        prompt: 'Compile comprehensive reference list in required format (typically APA). Include all cited sources.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Use required citation style', 'Include ALL cited sources', 'Format consistently', 'Alphabetize properly', 'Include DOIs', 'Double-check accuracy'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    }
                ]
            },
            {
                title: 'Appendices',
                sections: [
                    {
                        title: 'Appendices',
                        type: 'report',
                        prompt: 'Include all supplementary materials: instruments, protocols, additional data, ethical approvals, etc.',
                        behaviors: [{ name: 'research assistant', type: 'persona' }],
                        guidelines: ['Label systematically (Appendix A, B, C...)', 'Include all instruments', 'Add ethical approval documents', 'Include relevant supplementary data', 'Reference in main text'],
                        controls: { ...defaultControls, formality: 90 }
                    }
                ]
            }
        ]
    },
    {
        id: 'postdoc-research-proposal',
        name: 'Post-Doctoral Research Proposal',
        description: 'Comprehensive research proposal template for post-doctoral fellowship or position applications.',
        projectType: 'Research Proposal',
        educationalLevel: 'Post-Doctoral',
        content: [
            {
                title: 'Executive Summary',
                sections: [
                    {
                        title: 'Project Summary',
                        type: 'report',
                        prompt: 'Write a compelling executive summary (300-500 words) that captures the essence of your proposed research: problem, approach, innovation, and expected impact.',
                        behaviors: [{ name: 'senior researcher', type: 'persona' }],
                        guidelines: ['State research problem concisely', 'Highlight innovation and significance', 'Mention expected outcomes', 'Show broader impact', 'Make it compelling', 'Keep within word limit'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 95, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Background and Significance',
                sections: [
                    {
                        title: 'Research Context',
                        type: 'report',
                        prompt: 'Establish the research context and current state of knowledge in the field. Show deep understanding of the domain.',
                        behaviors: [{ name: 'expert researcher', type: 'persona' }],
                        guidelines: ['Demonstrate field expertise', 'Review current state of knowledge', 'Identify key challenges', 'Show recent developments', 'Establish credibility'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '1000' }
                    },
                    {
                        title: 'Significance and Innovation',
                        type: 'report',
                        prompt: 'Articulate the significance of proposed research and its innovative aspects. Explain potential to advance the field.',
                        behaviors: [{ name: 'innovation strategist', type: 'persona' }],
                        guidelines: ['Explain scientific significance', 'Highlight innovative aspects', 'Show potential for advancement', 'Discuss broader impact', 'Be compelling'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 95, wordCount: '800' }
                    },
                    {
                        title: 'Critical Analysis of Current Approaches',
                        type: 'report',
                        prompt: 'Critically analyze current approaches and their limitations. Show why new research is needed.',
                        behaviors: [{ name: 'critical scholar', type: 'persona' }],
                        guidelines: ['Review current approaches', 'Identify limitations', 'Critique methodologies', 'Show gaps', 'Build case for your research'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '1000' }
                    }
                ]
            },
            {
                title: 'Preliminary Studies',
                sections: [
                    {
                        title: 'Previous Work and Experience',
                        type: 'report',
                        prompt: 'Describe your previous work and experience relevant to this proposal. Show track record and preparedness.',
                        behaviors: [{ name: 'senior researcher', type: 'persona' }],
                        guidelines: ['Highlight relevant experience', 'Show track record', 'Demonstrate expertise', 'Connect to proposed research', 'Be specific'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 90, wordCount: '800' }
                    },
                    {
                        title: 'Preliminary Data and Results',
                        type: 'report',
                        prompt: 'Present preliminary data, pilot studies, or proof-of-concept results that support feasibility of proposed research.',
                        behaviors: [{ name: 'experimental scientist', type: 'persona' }],
                        guidelines: ['Show preliminary results', 'Demonstrate feasibility', 'Present data clearly', 'Explain significance', 'Build confidence'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 90, wordCount: '1200', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Research Design and Methods',
                sections: [
                    {
                        title: 'Research Questions and Hypotheses',
                        type: 'report',
                        prompt: 'State clear research questions or hypotheses. Make them specific, testable, and significant.',
                        behaviors: [{ name: 'research methodologist', type: 'persona' }],
                        guidelines: ['State questions clearly', 'Ensure testability', 'Show significance', 'Align with significance', 'Be precise'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95 }
                    },
                    {
                        title: 'Research Approach and Design',
                        type: 'report',
                        prompt: 'Describe overall research approach and design. Explain choice and justify appropriateness.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Describe approach comprehensively', 'Justify design choices', 'Show methodological rigor', 'Ensure feasibility', 'Address potential challenges'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '1500' }
                    },
                    {
                        title: 'Experimental Methods and Procedures',
                        type: 'report',
                        prompt: 'Detail experimental methods, procedures, and protocols. Ensure reproducibility and rigor.',
                        behaviors: [{ name: 'experimental methodologist', type: 'persona' }],
                        guidelines: ['Describe methods in detail', 'Ensure reproducibility', 'Mention controls', 'Discuss validation', 'Show rigor'],
                        controls: { ...defaultControls, formality: 95, tone: 'technical', complexity: 95, wordCount: '1500' }
                    },
                    {
                        title: 'Data Analysis Plan',
                        type: 'report',
                        prompt: 'Describe data analysis plan including statistical methods, analytical frameworks, and interpretation strategies.',
                        behaviors: [{ name: 'data scientist', type: 'persona' }],
                        guidelines: ['Describe analytical approach', 'Specify statistical methods', 'Mention software/tools', 'Plan for different scenarios', 'Ensure rigor'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '1000' }
                    }
                ]
            },
            {
                title: 'Expected Outcomes',
                sections: [
                    {
                        title: 'Expected Results and Deliverables',
                        type: 'report',
                        prompt: 'Describe expected results and deliverables. Be specific about what the research will produce.',
                        behaviors: [{ name: 'research planner', type: 'persona' }],
                        guidelines: ['List expected outcomes', 'Be specific', 'Make deliverables clear', 'Show significance', 'Be realistic'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 90, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Impact and Contribution',
                        type: 'report',
                        prompt: 'Articulate the potential impact and contribution to the field. Show transformative potential.',
                        behaviors: [{ name: 'impact strategist', type: 'persona' }],
                        guidelines: ['Explain scientific impact', 'Discuss broader implications', 'Show transformative potential', 'Mention applications', 'Be visionary yet realistic'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 90, wordCount: '800' }
                    },
                    {
                        title: 'Dissemination Plan',
                        type: 'report',
                        prompt: 'Describe plan for disseminating results through publications, conferences, and other channels.',
                        behaviors: [{ name: 'research communicator', type: 'persona' }],
                        guidelines: ['Plan for high-impact publications', 'Identify target conferences', 'Consider public engagement', 'Mention collaborations', 'Show strategy'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85 }
                    }
                ]
            },
            {
                title: 'Timeline and Milestones',
                sections: [
                    {
                        title: 'Research Timeline',
                        type: 'report',
                        prompt: 'Provide detailed timeline with phases, milestones, and deliverables. Show realistic planning.',
                        behaviors: [{ name: 'project manager', type: 'persona' }],
                        guidelines: ['Break into phases', 'Set clear milestones', 'Include decision points', 'Be realistic', 'Show dependencies'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Risk Assessment and Mitigation',
                        type: 'report',
                        prompt: 'Identify potential risks and challenges with mitigation strategies.',
                        behaviors: [{ name: 'risk analyst', type: 'persona' }],
                        guidelines: ['Identify key risks', 'Assess probability and impact', 'Propose mitigation strategies', 'Show contingency plans', 'Be proactive'],
                        controls: { ...defaultControls, formality: 90, tone: 'academic', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Resources and Collaboration',
                sections: [
                    {
                        title: 'Required Resources and Facilities',
                        type: 'report',
                        prompt: 'Describe resources and facilities needed. Show access and availability.',
                        behaviors: [{ name: 'resource planner', type: 'persona' }],
                        guidelines: ['List required resources', 'Mention equipment/facilities', 'Show access', 'Justify needs', 'Be specific'],
                        controls: { ...defaultControls, formality: 90, tone: 'explanatory', complexity: 80 }
                    },
                    {
                        title: 'Collaborative Network',
                        type: 'report',
                        prompt: 'Describe collaborative network and partnerships that strengthen the proposal.',
                        behaviors: [{ name: 'collaboration strategist', type: 'persona' }],
                        guidelines: ['Identify key collaborators', 'Explain their roles', 'Show complementary expertise', 'Mention letters of support', 'Strengthen credibility'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85 }
                    }
                ]
            },
            {
                title: 'Budget and Justification',
                sections: [
                    {
                        title: 'Budget Overview',
                        type: 'report',
                        prompt: 'Provide detailed budget breakdown with clear categories and amounts.',
                        behaviors: [{ name: 'grant administrator', type: 'persona' }],
                        guidelines: ['Break down by category', 'Be detailed and specific', 'Use realistic figures', 'Follow funder guidelines', 'Present in table'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 80, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Budget Justification',
                        type: 'report',
                        prompt: 'Justify each major budget item. Explain necessity and reasonableness.',
                        behaviors: [{ name: 'grant writer', type: 'persona' }],
                        guidelines: ['Justify major expenses', 'Explain necessity', 'Show cost-effectiveness', 'Link to activities', 'Be convincing'],
                        controls: { ...defaultControls, formality: 90, tone: 'persuasive', complexity: 80 }
                    }
                ]
            },
            {
                title: 'References',
                sections: [
                    {
                        title: 'References',
                        type: 'report',
                        prompt: 'Compile comprehensive reference list demonstrating knowledge of the field.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Include key literature', 'Use required citation style', 'Format consistently', 'Include recent works', 'Show field knowledge'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    }
                ]
            }
        ]
    },
    {
        id: 'grant-proposal',
        name: 'Research Grant Proposal',
        description: 'Comprehensive grant proposal template for funding agencies (NIH, NSF, etc.).',
        projectType: 'Grant Proposal',
        educationalLevel: 'Post-Doctoral',
        content: [
            {
                title: 'Project Summary/Abstract',
                sections: [
                    {
                        title: 'Project Summary',
                        type: 'report',
                        prompt: 'Write concise project summary following funder requirements. Typically 250-500 words covering objectives, methods, and significance.',
                        behaviors: [{ name: 'grant writer', type: 'persona' }],
                        guidelines: ['Follow page limits strictly', 'State objectives clearly', 'Summarize approach', 'Highlight significance', 'Mention broader impacts', 'Be compelling'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 95, wordCount: '400' }
                    }
                ]
            },
            {
                title: 'Project Description',
                sections: [
                    {
                        title: 'Introduction and Background',
                        type: 'report',
                        prompt: 'Provide introduction establishing context, reviewing literature, and identifying research gap.',
                        behaviors: [{ name: 'principal investigator', type: 'persona' }],
                        guidelines: ['Establish context', 'Review key literature', 'Identify gap', 'Build compelling case', 'Show expertise'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '1500', citationStyle: 'APA7' }
                    },
                    {
                        title: 'Specific Aims and Objectives',
                        type: 'report',
                        prompt: 'State specific aims clearly and concisely. Each aim should be testable and achievable.',
                        behaviors: [{ name: 'research strategist', type: 'persona' }],
                        guidelines: ['List 2-4 specific aims', 'Make aims clear and testable', 'Show logical progression', 'Align with overall goal', 'Be realistic'],
                        controls: { ...defaultControls, formality: 95, tone: 'explanatory', complexity: 90, outputStyle: { ...defaultControls.outputStyle, list: true } }
                    },
                    {
                        title: 'Significance and Innovation',
                        type: 'report',
                        prompt: 'Articulate significance and innovative aspects. Explain how research advances field and addresses important problem.',
                        behaviors: [{ name: 'impact strategist', type: 'persona' }],
                        guidelines: ['Explain scientific significance', 'Describe innovative aspects', 'Show potential impact', 'Address importance', 'Be compelling', 'Use evidence'],
                        controls: { ...defaultControls, formality: 95, tone: 'persuasive', complexity: 95, wordCount: '1200' }
                    },
                    {
                        title: 'Approach and Methodology',
                        type: 'report',
                        prompt: 'Describe research approach for each aim. Include methods, analysis, and anticipated challenges.',
                        behaviors: [{ name: 'methodological expert', type: 'persona' }],
                        guidelines: ['Organize by specific aim', 'Describe methods in detail', 'Explain rationale', 'Address potential problems', 'Show feasibility', 'Include preliminary data'],
                        controls: { ...defaultControls, formality: 95, tone: 'technical', complexity: 95, wordCount: '3000' }
                    }
                ]
            },
            {
                title: 'Preliminary Studies',
                sections: [
                    {
                        title: 'Preliminary Studies and Progress',
                        type: 'report',
                        prompt: 'Present preliminary studies demonstrating feasibility. Include data, publications, and evidence of productivity.',
                        behaviors: [{ name: 'senior researcher', type: 'persona' }],
                        guidelines: ['Show relevant preliminary data', 'Demonstrate feasibility', 'Highlight publications', 'Show productivity', 'Build confidence'],
                        controls: { ...defaultControls, formality: 95, tone: 'academic', complexity: 95, wordCount: '2000', outputStyle: { ...defaultControls.outputStyle, table: true } }
                    }
                ]
            },
            {
                title: 'Research Team and Environment',
                sections: [
                    {
                        title: 'Research Team Qualifications',
                        type: 'report',
                        prompt: 'Describe research team qualifications and roles. Show complementary expertise.',
                        behaviors: [{ name: 'team leader', type: 'persona' }],
                        guidelines: ['Describe key personnel', 'Highlight qualifications', 'Define roles', 'Show complementarity', 'Demonstrate capability'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85 }
                    },
                    {
                        title: 'Research Environment and Resources',
                        type: 'report',
                        prompt: 'Describe institutional environment and available resources supporting the research.',
                        behaviors: [{ name: 'institutional representative', type: 'persona' }],
                        guidelines: ['Describe facilities', 'Mention equipment', 'Show institutional support', 'Highlight resources', 'Demonstrate capacity'],
                        controls: { ...defaultControls, formality: 90, tone: 'explanatory', complexity: 80 }
                    },
                    {
                        title: 'Collaborations and Partnerships',
                        type: 'report',
                        prompt: 'Describe collaborations strengthening the proposal. Include letters of support.',
                        behaviors: [{ name: 'collaboration coordinator', type: 'persona' }],
                        guidelines: ['Identify collaborators', 'Explain contributions', 'Show added value', 'Mention commitments', 'Strengthen proposal'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85 }
                    }
                ]
            },
            {
                title: 'Timeline and Management',
                sections: [
                    {
                        title: 'Project Timeline',
                        type: 'report',
                        prompt: 'Provide detailed timeline showing phases, milestones, and deliverables over funding period.',
                        behaviors: [{ name: 'project coordinator', type: 'persona' }],
                        guidelines: ['Break into phases/years', 'Set clear milestones', 'Show progression', 'Be realistic', 'Align with budget'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Project Management Plan',
                        type: 'report',
                        prompt: 'Describe project management approach including oversight, communication, and quality control.',
                        behaviors: [{ name: 'program manager', type: 'persona' }],
                        guidelines: ['Describe management structure', 'Explain oversight', 'Address communication', 'Show quality control', 'Demonstrate capability'],
                        controls: { ...defaultControls, formality: 90, tone: 'professional', complexity: 80 }
                    }
                ]
            },
            {
                title: 'Broader Impacts',
                sections: [
                    {
                        title: 'Broader Impacts and Dissemination',
                        type: 'report',
                        prompt: 'Describe broader impacts beyond scientific community. Include education, outreach, and societal benefits.',
                        behaviors: [{ name: 'outreach coordinator', type: 'persona' }],
                        guidelines: ['Address multiple impact areas', 'Include education/training', 'Mention outreach', 'Show societal benefit', 'Be specific and realistic'],
                        controls: { ...defaultControls, formality: 90, tone: 'persuasive', complexity: 85, wordCount: '1000' }
                    },
                    {
                        title: 'Data Management and Sharing Plan',
                        type: 'report',
                        prompt: 'Describe plan for data management, preservation, and sharing following funder requirements.',
                        behaviors: [{ name: 'data steward', type: 'persona' }],
                        guidelines: ['Address data types', 'Explain storage and backup', 'Describe sharing plan', 'Mention repositories', 'Follow funder requirements'],
                        controls: { ...defaultControls, formality: 90, tone: 'technical', complexity: 80 }
                    }
                ]
            },
            {
                title: 'Budget and Justification',
                sections: [
                    {
                        title: 'Detailed Budget',
                        type: 'report',
                        prompt: 'Provide detailed budget for each year following funder format. Include all cost categories.',
                        behaviors: [{ name: 'budget specialist', type: 'persona' }],
                        guidelines: ['Follow funder budget format', 'Break down by year', 'Include all categories', 'Use institutional rates', 'Be accurate'],
                        controls: { ...defaultControls, formality: 95, tone: 'professional', complexity: 85, outputStyle: { ...defaultControls.outputStyle, table: true } }
                    },
                    {
                        title: 'Budget Justification',
                        type: 'report',
                        prompt: 'Justify each budget line item. Explain necessity and show alignment with project activities.',
                        behaviors: [{ name: 'grant financial officer', type: 'persona' }],
                        guidelines: ['Justify personnel costs', 'Explain equipment needs', 'Justify travel', 'Link costs to activities', 'Show necessity'],
                        controls: { ...defaultControls, formality: 90, tone: 'persuasive', complexity: 80 }
                    }
                ]
            },
            {
                title: 'Supporting Documents',
                sections: [
                    {
                        title: 'References Cited',
                        type: 'report',
                        prompt: 'Compile complete reference list demonstrating thorough knowledge of literature.',
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ['Include all cited sources', 'Use required format', 'Show current literature', 'Demonstrate field knowledge', 'Format consistently'],
                        controls: { ...defaultControls, formality: 100, tone: 'academic', citationStyle: 'APA7' }
                    },
                    {
                        title: 'Facilities and Equipment',
                        type: 'report',
                        prompt: 'Describe available facilities and equipment supporting the research.',
                        behaviors: [{ name: 'facilities manager', type: 'persona' }],
                        guidelines: ['List major facilities', 'Describe equipment', 'Show capabilities', 'Mention shared resources', 'Demonstrate adequacy'],
                        controls: { ...defaultControls, formality: 90, tone: 'explanatory', complexity: 75 }
                    }
                ]
            }
        ]
    }
];

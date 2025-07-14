
'use client';

export interface ProposalTemplate {
    name: string;
    description: string;
    prompt: string;
    guidelines?: string[];
}

export type ProposalTemplateKey = 'default' | 'agile' | 'marketing';

const basePrompt = `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date. Also, provide a list of 3 to 5 relevant tags for the project based on its content.

IMPORTANT: For all fields that contain descriptive text (like 'objective', 'methodology', 'evaluation', 'interest', 'description', and 'mitigation'), you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.

Project Idea: {{{projectIdea}}}`;


export const templates: Record<ProposalTemplateKey, ProposalTemplate> = {
    default: {
        name: 'Default Software Proposal',
        description: 'A standard, comprehensive template for software development projects.',
        prompt: basePrompt,
        guidelines: [
            "The methodology should be based on a hybrid approach, combining elements of Waterfall for planning and Agile for execution.",
            "The budget breakdown should include standard software development roles like Project Manager, UI/UX Designer, Frontend Developer, and Backend Developer.",
            "Risks should consider technical challenges, scope creep, and resource availability."
        ]
    },
    agile: {
        name: 'Agile Project Proposal',
        description: 'A template focused on Agile methodologies, with iterative phases.',
        prompt: basePrompt,
        guidelines: [
            "The methodology must be explicitly defined as Agile, using frameworks like Scrum or Kanban.",
            "The timeline should be structured into short, iterative phases called 'Sprints', each lasting 2-4 weeks.",
            "Success criteria should emphasize continuous delivery, stakeholder feedback, and adaptability to change."
        ]
    },
    marketing: {
        name: 'Marketing Campaign Brief',
        description: 'A template tailored for planning and proposing a marketing campaign.',
        prompt: `You are an expert marketing strategist. A user will provide you with a product or service idea. Your task is to generate a comprehensive marketing campaign proposal (brief).

Fill out the fields as if you are creating a marketing plan. The 'objective' should be a marketing goal (e.g., increase brand awareness, generate leads). The 'methodology' should describe the campaign strategy. The 'timeline' phases should be marketing activities (e.g., 'Market Research', 'Content Creation', 'Campaign Launch'). The 'budget' should reflect marketing spend (e.g., 'Ad Spend', 'Content Production'). The 'stakeholders' should be marketing roles.

Project Idea: {{{projectIdea}}}`,
        guidelines: [
            "Expected outcomes should be tied to specific marketing KPIs (Key Performance Indicators) like website traffic, conversion rate, or social media engagement.",
            "The budget breakdown must include items like Ad Spend, Influencer Collaboration, and Content Production.",
            "Risks should focus on market competition, ad performance, and brand reputation."
        ]
    }
};



export interface ProposalTemplate {
    id: string;
    name: string;
    description: string;
    prompt: string;
    guidelines?: string[];
    jsonStructure?: any;
}

const basePrompt = `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date. Also, provide a list of 3 to 5 relevant tags for the project based on its content.

IMPORTANT: For all fields that contain descriptive text (like 'objective', 'methodology', 'evaluation', 'interest', 'description', and 'mitigation'), you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.

Your entire response must be a valid JSON object that adheres to the structure provided below.

Project Idea: {{{projectIdea}}}`;


export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
    {
        id: 'default-software',
        name: 'Default Software Proposal',
        description: 'A standard, comprehensive template for software development projects.',
        prompt: basePrompt + `\n\nOutput the proposal as a JSON object following this structure: { "category": "...", "title": "...", "objective": "...", "methodology": "...", "expected_outcome": [...], "timeline": { "startDate": "...", "endDate": "...", "phases": [...] }, "budget": { "totalAmount": ..., "currency": "...", "breakdown": [...] }, "stakeholders": [...], "success_criteria": [...], "evaluation": "...", "tags": [...], "risks": [...] }`,
        guidelines: [
            "The methodology should be based on a hybrid approach, combining elements of Waterfall for planning and Agile for execution.",
            "The budget breakdown should include standard software development roles like Project Manager, UI/UX Designer, Frontend Developer, and Backend Developer.",
            "Risks should consider technical challenges, scope creep, and resource availability."
        ]
    },
    {
        id: 'agile-project',
        name: 'Agile Project Proposal',
        description: 'A template focused on Agile methodologies, with iterative phases and flexible scope.',
        prompt: basePrompt + `\n\nOutput the proposal as a JSON object optimized for an Agile project, following this structure: { "title": "...", "productGoal": "...", "productBacklog": [...], "sprints": [...] }`,
        guidelines: [
            "The methodology must be explicitly defined as Agile, using frameworks like Scrum or Kanban.",
            "The timeline should be structured into short, iterative phases called 'Sprints', each lasting 2-4 weeks.",
            "Success criteria should emphasize continuous delivery, stakeholder feedback, and adaptability to change."
        ]
    }
];

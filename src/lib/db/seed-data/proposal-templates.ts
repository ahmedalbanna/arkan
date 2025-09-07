

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
        id: 'automatic-ai',
        name: 'Automatic (AI-Generated)',
        description: 'Let the AI analyze your idea and generate the most suitable proposal structure and content.',
        prompt: `You are an expert project analyst. A user will provide a project idea. Your task is to analyze the idea and generate a complete, professional, and well-structured project proposal in JSON format.
        
Based on the user's idea, you must determine the most appropriate sections and details for the proposal. The structure should be logical and comprehensive.
For all descriptive text, you MUST use well-formed markdown.
Your entire response must be a valid JSON object.

Project Idea: {{{projectIdea}}}`,
        guidelines: [],
        jsonStructure: {
            "title": "AI will generate a fitting title",
            "objective": "AI will generate a detailed objective",
            "sections": "AI will determine the necessary sections (e.g., Scope, Budget, Timeline, Risks)"
        }
    },
    {
        id: 'default-software',
        name: 'Default Software Proposal',
        description: 'A standard, comprehensive template for software development projects.',
        prompt: basePrompt,
        guidelines: [
            "The methodology should be based on a hybrid approach, combining elements of Waterfall for planning and Agile for execution.",
            "The budget breakdown should include standard software development roles like Project Manager, UI/UX Designer, Frontend Developer, and Backend Developer.",
            "Risks should consider technical challenges, scope creep, and resource availability."
        ],
        jsonStructure: {
            category: "Software Development",
            title: "Project Title",
            objective: "Main goal of the project.",
            methodology: "Agile, Waterfall, etc.",
            expected_outcome: ["Outcome 1", "Outcome 2"],
            timeline: {
                startDate: "YYYY-MM-DD",
                endDate: "YYYY-MM-DD",
                phases: [{ name: "Phase 1", durationWeeks: 4 }]
            },
            budget: {
                totalAmount: 50000,
                currency: "USD",
                breakdown: [{ item: "Labor", cost: 40000 }]
            },
            stakeholders: [{ name: "Client", role: "Sponsor", interest: "Project success" }],
            success_criteria: ["Criterion 1", "Criterion 2"],
            evaluation: "How success will be measured.",
            tags: ["tag1", "tag2"],
            risks: [{ description: "Potential risk", mitigation: "Mitigation strategy" }]
        }
    },
    {
        id: 'agile-project',
        name: 'Agile Project Proposal',
        description: 'A template focused on Agile methodologies, with iterative phases and flexible scope.',
        prompt: basePrompt,
        guidelines: [
            "The methodology must be explicitly defined as Agile, using frameworks like Scrum or Kanban.",
            "The timeline should be structured into short, iterative phases called 'Sprints', each lasting 2-4 weeks.",
            "Success criteria should emphasize continuous delivery, stakeholder feedback, and adaptability to change."
        ],
        jsonStructure: {
            category: "Agile Software Development",
            title: "Project Title",
            productGoal: "The high-level goal of the product.",
            methodology: "Scrum",
            timeline: {
                sprints: [
                    { name: "Sprint 1: Setup & Auth", durationWeeks: 2 },
                    { name: "Sprint 2: Core Features", durationWeeks: 2 }
                ]
            },
            teamRoles: ["Product Owner", "Scrum Master", "Development Team"],
            risks: [{ description: "Potential risk", mitigation: "Mitigation strategy" }]
        }
    },
    {
        id: 'student-training-plan',
        name: 'Student Training Plan',
        description: 'A template for creating a detailed training plan for a student or intern within a company.',
        prompt: `You are a Human Resources Development expert. A user will provide a brief about a student starting a training program. Your task is to generate a comprehensive training plan. The plan should be well-structured and provide a clear roadmap for the student's internship period.

Your entire response must be a valid JSON object that adheres to the structure provided below.

Student Training Idea: {{{projectIdea}}}`,
        guidelines: [
            "The weekly plan should show a logical progression of skills and responsibilities.",
            "Training objectives should be specific and measurable.",
            "The evaluation method should be clear and fair."
        ],
        jsonStructure: {
            title: "Training Plan: [Student Name]",
            studentInfo: {
                name: "Student Name",
                university: "University Name",
                major: "Field of Study"
            },
            companyInfo: {
                companyName: "Company Name",
                department: "Department Name",
                supervisor: "Supervisor Name"
            },
            trainingPeriod: {
                startDate: "YYYY-MM-DD",
                endDate: "YYYY-MM-DD",
                durationWeeks: 12
            },
            trainingObjectives: [
                "Objective 1: Understand company's core business.",
                "Objective 2: Gain proficiency in [Specific Tool/Software].",
                "Objective 3: Complete a small-scale project independently."
            ],
            weeklyPlan: [
                {
                    week: 1,
                    focus: "Onboarding & Introduction",
                    tasks: ["Complete HR onboarding", "Meet the team", "Review company policies"],
                    learningGoals: ["Understand company culture", "Learn team members' roles"]
                },
                {
                    week: 2,
                    focus: "Introduction to Core Tools",
                    tasks: ["Complete tutorials for [Software]", "Shadow supervisor"],
                    learningGoals: ["Basic operation of [Software]"]
                }
            ],
            evaluationMethod: "The student's performance will be evaluated based on their final project presentation, feedback from their supervisor, and their demonstrated ability to complete assigned tasks.",
            tags: ["training", "internship", "student-plan"]
        }
    }
];

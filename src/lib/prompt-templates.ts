
import {
    Bot, FileText, Globe, Search, Folder, MessageSquare, Calendar, Zap, Rocket, Pen, Mail, MessageCircle,
    User, List, ShoppingCart, Newspaper, BarChart, Settings, SearchCode, Beaker, GraduationCap, Building,
    Landmark, Phone, BrainCircuit
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PromptCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
}

export interface PromptTemplate {
  category: string;
  title: string;
  prompt: string;
  targetAgentIds?: string[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
    { id: 'taskade-ai', name: 'Taskade AI', icon: Bot, count: 48 },
    { id: 'site-reader', name: 'Site Reader', icon: FileText, count: 29 },
    { id: 'web-search', name: 'Web Search', icon: Globe, count: 15 },
    { id: 'deep-research', name: 'Deep Research', icon: Search, count: 15 },
    { id: 'organization', name: 'Organization', icon: Folder, count: 15 },
    { id: 'content', name: 'Content', icon: MessageSquare, count: 30 },
    { id: 'project-management', name: 'Project Management', icon: Calendar, count: 33 },
    { id: 'productivity', name: 'Productivity', icon: Zap, count: 23 },
    { id: 'sales', name: 'Sales', icon: Rocket, count: 45 },
    { id: 'copywriting', name: 'Copywriting', icon: Pen, count: 25 },
    { id: 'email-marketing', name: 'Email Marketing', icon: Mail, count: 32 },
    { id: 'social-media', name: 'Social Media', icon: MessageCircle, count: 45 },
    { id: 'branding-design', name: 'Branding / Design', icon: User, count: 18 },
    { id: 'ux-ui', name: 'UX/UI', icon: List, count: 17 },
    { id: 'e-commerce', name: 'E-commerce', icon: ShoppingCart, count: 16 },
    { id: 'entrepreneurship', name: 'Entrepreneurship', icon: Newspaper, count: 40 },
    { id: 'influencer-marketing', name: 'Influencer Marketing', icon: BarChart, count: 28 },
    { id: 'legal', name: 'Legal', icon: Landmark, count: 30 },
    { id: 'website-creation', name: 'Website Creation', icon: Settings, count: 27 },
    { id: 'analytics', name: 'Analytics', icon: BarChart, count: 21 },
    { id: 'seo', name: 'SEO', icon: SearchCode, count: 31 },
    { id: 'engineering', name: 'Engineering', icon: Beaker, count: 25 },
    { id: 'research', name: 'Research', icon: Beaker, count: 20 },
    { id: 'strategy', name: 'Strategy', icon: BrainCircuit, count: 15 },
    { id: 'advertising', name: 'Advertising', icon: Rocket, count: 15 },
    { id: 'education', name: 'Education', icon: GraduationCap, count: 15 },
    { id: 'agency', name: 'Agency', icon: Building, count: 28 },
    { id: 'real-estate', name: 'Real Estate', icon: Building, count: 26 },
    { id: 'support', name: 'Support', icon: Phone, count: 34 },
    { id: 'ai-automation', name: 'AI & Automation', icon: BrainCircuit, count: 13 },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        category: 'Report Generation',
        title: 'Generate an Introduction',
        prompt: `You are an expert technical writer specializing in project proposals. Based on the provided project proposal and any additional context, write a complete and professional introduction section for the formal report. Synthesize the information from the entire proposal and the provided context to create this introduction. Infer the problem from the objective and risks. Infer the limitations of existing systems from the project's goals. Generate the entire introduction as a single, coherent text. Use markdown newlines for paragraph breaks.`,
        targetAgentIds: ['generate-introduction-section']
    },
    {
        category: 'Diagram Generation',
        title: 'Create a Use Case Diagram',
        prompt: `Based on the project's stakeholders and objectives, create a PlantUML use case diagram that shows the primary actors and their interactions with the system. Use rectangles to group related use cases within a system boundary.`,
        targetAgentIds: ['generate-use-case-diagram']
    },
    {
        category: 'Taskade AI',
        title: 'Create Task',
        prompt: "Create a task titled '[Task Title]'."
    },
    {
        category: 'Taskade AI',
        title: 'Assign Tasks with Tags',
        prompt: "Assign all tasks with [#Tag] to [Assignee]."
    },
    {
        category: 'Taskade AI',
        title: 'Schedule Tasks with Tags',
        prompt: "Schedule all [#Tag] tasks for [Date/Time]."
    },
    {
        category: 'Taskade AI',
        title: 'Unassign User from Tasks',
        prompt: "Unassign [User] from [#Tag] tasks."
    },
    {
        category: 'Taskade AI',
        title: 'Complete Tasks by Criteria',
        prompt: "Complete all tasks assigned to [User/Me]."
    },
    {
        category: 'Taskade AI',
        title: 'Add Due Date',
        prompt: "Add a due date of [Date] to all [#Tag] tasks."
    },
    {
        category: 'Taskade AI',
        title: 'Update Due Date',
        prompt: "Update due dates for all [#Tag] tasks to [Date]."
    },
    {
        category: 'Taskade AI',
        title: 'Remove Due Date',
        prompt: "Remove all due dates for tasks assigned to [User/Me]."
    },
    {
        category: 'Taskade AI',
        title: 'Create Project',
        prompt: "Create a new project called '[Project Name]' in the [Workspace/Folder]."
    },
    {
        category: 'Taskade AI',
        title: 'Search the Web',
        prompt: "Find recent news articles about [Topic]."
    },
    {
        category: 'Taskade AI',
        title: 'Summarize from URLs',
        prompt: "Extract and summarize key points from: [URL(s)]."
    },
    {
        category: 'Taskade AI',
        title: 'Smart Project Creation',
        prompt: "Create a comprehensive project for [Project Name] with structured tasks and subtasks. Assign tasks to [Team Members], set due dates, and add tags like [#priority/#urgent/#review]. Organize tasks by phases and dependencies."
    },
    {
        category: 'Taskade AI',
        title: 'Automated Task Workflow',
        prompt: "Create an automated workflow for [Process Type]: generate tasks from [Template], assign based on [Skills/Availability], set due dates, add checklist items, and create follow-up tasks with dependencies and milestones."
    }
];

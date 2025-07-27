
import {
  FileText,
  GitBranch,
  GanttChartSquare,
  Package,
  FilePenLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean; // Default state
}

export const AVAILABLE_TOOLS: AgentTool[] = [
  {
    id: 'generateReportSection',
    name: 'Generate Report Section',
    icon: FileText,
    description: 'Generates a specific section of the project report (e.g., introduction, conclusion).',
    isActive: true,
  },
  {
    id: 'updateProposalField',
    name: 'Update Proposal Field',
    icon: FilePenLine,
    description: 'Updates a specific field or value within the project proposal document.',
    isActive: true,
  },
  {
    id: 'generateDiagram',
    name: 'Generate Diagram',
    icon: GitBranch,
    description: 'Generates a system diagram (e.g., use-case, class, sequence) based on the project proposal.',
    isActive: true,
  },
  {
    id: 'addTaskToPhase',
    name: 'Add Task to Project Plan',
    icon: GanttChartSquare,
    description: 'Adds a new task or user story to a specific phase of the project plan.',
    isActive: true,
  },
  {
    id: 'generateCodebase',
    name: 'Generate Codebase',
    icon: Package,
    description: 'Scaffolds a complete boilerplate codebase for the project based on the proposal.',
    isActive: false,
  },
];

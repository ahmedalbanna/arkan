import { FileSpreadsheet, FileText, GitGraph, BrainCircuit } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'Content Generation' | 'Diagrams';
  icon: LucideIcon;
  pageUrl: string;
  isEnabled: boolean;
}

export const AGENTS: Agent[] = [
  {
    id: 'summarize',
    name: 'وكيل تلخيص المشروع',
    description: 'يولد ملخصًا موجزًا للمشروع بناءً على وصف تفصيلي، مع تسليط الضوء على الجوانب الرئيسية والتقنيات المستخدمة.',
    category: 'Content Generation',
    icon: BrainCircuit,
    pageUrl: '/summarize',
    isEnabled: true,
  },
  {
    id: 'generate-proposal',
    name: 'وكيل توليد مقترح المشروع',
    description: 'ينشئ مقترح مشروع شامل واحترافي من فكرة مشروع واحدة، مكتمل بالجداول الزمنية والميزانية والمخاطر.',
    category: 'Content Generation',
    icon: FileText,
    pageUrl: '/generate-proposal',
    isEnabled: true,
  },
  {
    id: 'generate-report',
    name: 'وكيل توليد التقرير الكامل',
    description: 'يبني تقرير مشروع كامل قسمًا بقسم، بما في ذلك المقدمة، ومراجعة الأدبيات، وتحليل النظام، والمزيد.',
    category: 'Content Generation',
    icon: FileSpreadsheet,
    pageUrl: '/generate-report',
    isEnabled: true,
  },
  {
    id: 'generate-diagrams',
    name: 'وكيل توليد المخططات',
    description: 'ينتج مجموعة من 6 مخططات PlantUML مختلفة (حالة الاستخدام، الأصناف، إلخ) لتصور بنية النظام وسير العمل.',
    category: 'Diagrams',
    icon: GitGraph,
    pageUrl: '/generate-diagrams',
    isEnabled: true,
  },
];

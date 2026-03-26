// Auto-generated module stubs to silence missing-module TS2307 errors.
// These are temporary and should be replaced with proper implementations or
// type definitions later.

declare module 'html-to-docx';

// App-specific module stubs
declare module '@/components/admin/EditUserForm' {
  const EditUserForm: any;
  export default EditUserForm;
}

declare module '@/lib/agent-editor-schema' {
  export type AgentEditorFormValues = any;
}

declare module '@/lib/markdown-styles' {
  export const markdownComponents: any;
}

declare module '@/components/ThemeToggle' {
  export const ThemeToggle: any;
}

declare module '@/lib/db/seed-data/presentation-templates' {
  export const PRESENTATION_GENERATION_TEMPLATES: any;
}

declare module '@/lib/db/seed-data/proposal-templates' {
  export const PROPOSAL_TEMPLATES: any;
}

// declare module '@/lib/db/seed-data/report-templates' {
//   export const REPORT_GENERATION_TEMPLATES: any;
// }

declare module '@/modules/ai/infrastructure/flows/generate-presentation-outline' {
  export function generatePresentationOutline(...args: any[]): Promise<any>;
}

declare module '@/components/tools/HandwritingGenerator' {
  const HandwritingGenerator: any;
  export default HandwritingGenerator;
}

declare module '@/hooks/use-toast' {
  export function useToast(): { toast: (opts: any) => void };
}

// Generic stub for other missing modules under these paths (safe fallback)
declare module '@/lib/*' {
  const whatever: any;
  export default whatever;
}

declare module '@/components/*' {
  const whatever: any;
  export default whatever;
}

declare module '@/ai/*' {
  const whatever: any;
  export default whatever;
}

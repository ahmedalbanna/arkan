export interface ReportTemplateSection {
  id: string;
  title: string;
  type?: string;
  content?: string;
  lastUpdated?: string;
  controls?: unknown;
  [key: string]: unknown;
}


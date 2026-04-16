import { z } from 'zod';
import { Template, type BaseTemplateProperties } from './Template';
import type { ReportTemplateSection } from '../types/report-template';

export const ReportTemplateChapterSchema = z.object({
  title: z.string(),
  sections: z.array(z.any()), // Use any for schema to avoid deep recursion issues if needed, or refine
});

// Zod schema for ReportTemplateProperties
export const ReportTemplatePropertiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isDefault: z.boolean().optional(),
  content: z.array(ReportTemplateChapterSchema).optional(),
  // Project configuration fields
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  course: z.string().optional(),
  educationalLevel: z.string().optional(),
});


export const CreateReportTemplateSchema = ReportTemplatePropertiesSchema.omit({ id: true }).extend({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export const UpdateReportTemplateSchema = ReportTemplatePropertiesSchema.omit({ id: true }).partial();

export type CreateReportTemplateData = z.infer<typeof CreateReportTemplateSchema>;
export type UpdateReportTemplateData = z.infer<typeof UpdateReportTemplateSchema>;

// Corresponds to ReportGenerationTemplateSchema from the Zod schemas
export interface ReportTemplateProperties extends BaseTemplateProperties {
  isDefault?: boolean;
  content?: {
    title: string;
    sections: ReportTemplateSection[];
  }[];
  // Project configuration fields
  projectType?: string;
  specialization?: string;
  university?: string;
  course?: string;
  educationalLevel?: string;
}

export class ReportTemplate extends Template {
  public isDefault: boolean;
  public content: {
    title: string;
    sections: ReportTemplateSection[];
  }[];

  constructor(props: ReportTemplateProperties) {
    super(props);
    this.isDefault = props.isDefault || false;
    this.content = props.content || [];
  }
}

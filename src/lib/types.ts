import { z } from 'zod';

export type { UserProfile, UserRole, UserProperties } from '@/modules/users/domain/entities/User';
export type { ProjectProperties, ProjectContent } from '@/modules/projects/domain/entities/Project';
export type { ChapterProperties } from '@/modules/ai-content/domain/entities/Chapter';
export type { SectionProperties, SectionStatus } from '@/modules/ai-content/domain/entities/Section';
export type { TOCSection, TOC, TocSection, Toc } from '@/modules/ai-content/domain/entities/TOC';
export type { Language, Behavior, Tone, SectionType, SectionContext, ExternalContextType, GenerationControlState } from '@/modules/ai-content/domain/entities/ControlTypes';
export type { ExternalContextProperties } from '@/modules/ai-content/domain/entities/ExternalContext';
export type { TransactionProperties } from '@/modules/billing/domain/entities/Transaction';
export type { AgentProperties, Command } from '@/modules/ai/domain/entities/Agent';
export type { DiagramProperties } from '@/modules/ai/domain/entities/Diagram';
export type { BaseTemplateProperties } from '@/modules/templates/domain/entities/Template';
export type { DocxTemplateProperties } from '@/modules/templates/domain/entities/DocxTemplate';
export type { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';
export type { ReportTemplateProperties, CreateReportTemplateData, UpdateReportTemplateData } from '@/modules/templates/domain/entities/ReportTemplate';
export type { CustomStyles, ConversionOptions } from '@/modules/ai-content/infrastructure/exporters/word-converter/types';
export type { PptxStyleOptions } from '@/ai/schemas/template-schemas';
export type { BankAccount } from '@/modules/billing/domain/entities/BankAccount';
export type { PaymentMethod } from '@/modules/billing/domain/entities/PaymentMethod';

// File upload schema (used in forms)
export const fileSchema = z.object({
    file: z
        .instanceof(File)
        .refine((f) => f.size < 10 * 1024 * 1024, 'Max file size is 10MB.')
        .refine(
            (f) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type),
            'Only .jpg, .png, .webp or .pdf files are accepted.'
        ),
});

export const DOCX_TEMPLATE_KEYS = ['modern', 'classic', 'academic'] as const;

export type DocxTemplateKey = (typeof DOCX_TEMPLATE_KEYS)[number];

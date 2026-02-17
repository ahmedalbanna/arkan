

'use server';

import { prisma } from '@/lib/db/prisma';
import type { DocxTemplate, PptxTemplate, ReportTemplate } from '@prisma/client';

/**
 * Create a DOCX template
 */
export async function createDocxTemplate(data: {
  id: string;
  name: string;
  description: string;
  styles?: Record<string, unknown>;
  imageUrl?: string;
  dataAiHint?: string;
}): Promise<DocxTemplate> {
  // Check if template already exists
  const existing = await prisma.docxTemplate.findUnique({
    where: { id: data.id },
  });

  if (existing) {
    throw new Error(`A DOCX template with ID "${data.id}" already exists.`);
  }

  return await prisma.docxTemplate.create({
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      styles: data.styles || {},
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
    },
  });
}

/**
 * Get all DOCX templates
 */
export async function getDocxTemplates(): Promise<DocxTemplate[]> {
  return await prisma.docxTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single DOCX template by ID
 */
export async function getDocxTemplate(id: string): Promise<DocxTemplate | null> {
  return await prisma.docxTemplate.findUnique({
    where: { id },
  });
}

/**
 * Update a DOCX template
 */
export async function updateDocxTemplate(
  id: string,
  data: Partial<Omit<DocxTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<DocxTemplate> {
  return await prisma.docxTemplate.update({
    where: { id },
    data,
  });
}

/**
 * Delete a DOCX template
 */
export async function deleteDocxTemplate(id: string): Promise<void> {
  await prisma.docxTemplate.delete({
    where: { id },
  });
}

/**
 * Create a PPTX template
 */
export async function createPptxTemplate(data: {
  id: string;
  name: string;
  description: string;
  styles?: Record<string, unknown>;
  imageUrl?: string;
  dataAiHint?: string;
}): Promise<PptxTemplate> {
  const existing = await prisma.pptxTemplate.findUnique({
    where: { id: data.id },
  });

  if (existing) {
    throw new Error(`A PPTX template with ID "${data.id}" already exists.`);
  }

  return await prisma.pptxTemplate.create({
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      styles: data.styles || {},
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
    },
  });
}

/**
 * Get all PPTX templates
 */
export async function getPptxTemplates(): Promise<PptxTemplate[]> {
  return await prisma.pptxTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single PPTX template by ID
 */
export async function getPptxTemplate(id: string): Promise<PptxTemplate | null> {
  return await prisma.pptxTemplate.findUnique({
    where: { id },
  });
}

/**
 * Update a PPTX template
 */
export async function updatePptxTemplate(
  id: string,
  data: Partial<Omit<PptxTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PptxTemplate> {
  return await prisma.pptxTemplate.update({
    where: { id },
    data,
  });
}

/**
 * Delete a PPTX template
 */
export async function deletePptxTemplate(id: string): Promise<void> {
  await prisma.pptxTemplate.delete({
    where: { id },
  });
}

/**
 * Create a Report template
 */
export async function createReportTemplate(data: {
  id: string;
  name: string;
  description: string;
  content?: string;
  imageUrl?: string;
}): Promise<ReportTemplate> {
  const existing = await prisma.reportTemplate.findUnique({
    where: { id: data.id },
  });

  if (existing) {
    throw new Error(`A Report template with ID "${data.id}" already exists.`);
  }

  return await prisma.reportTemplate.create({
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      content: data.content || null,
      imageUrl: data.imageUrl || null,
    },
  });
}

/**
 * Get all Report templates
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  return await prisma.reportTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single Report template by ID
 */
export async function getReportTemplate(id: string): Promise<ReportTemplate | null> {
  return await prisma.reportTemplate.findUnique({
    where: { id },
  });
}

/**
 * Update a Report template
 */
export async function updateReportTemplate(
  id: string,
  data: Partial<Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ReportTemplate> {
  return await prisma.reportTemplate.update({
    where: { id },
    data,
  });
}

/**
 * Delete a Report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  await prisma.reportTemplate.delete({
    where: { id },
  });
}


'use server';

import { generateImage } from '@/ai/flows';
import { adminDb } from '@/lib/firebase/server-init';
import {
    CreateReportTemplateSchema,
    DocxTemplatePropertiesSchema,
    PptxTemplatePropertiesSchema,
    ReportTemplatePropertiesSchema,
    UpdateReportTemplateSchema,
} from '@/lib/models';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

// Revalidation Tags
const DOCX_TEMPLATES_TAG = 'docx-templates';
const PPTX_TEMPLATES_TAG = 'pptx-templates';
const REPORT_TEMPLATES_TAG = 'report-templates';

// Validation Schemas
const IdSchema = z.string().min(1, 'ID is required');
const CreateDocxTemplateSchema = DocxTemplatePropertiesSchema.pick({ id: true, name: true, description: true });
const UpdateDocxTemplateSchema = DocxTemplatePropertiesSchema.pick({ styles: true });

const CreatePptxTemplateSchema = PptxTemplatePropertiesSchema.pick({ id: true, name: true, description: true });
const UpdatePptxTemplateSchema = PptxTemplatePropertiesSchema.pick({ styles: true });


// --- Generic Template Functions ---

async function getTemplates<T>(type: 'docx' | 'pptx' | 'report'): Promise<T[]> {
    const collectionPath = type === 'report' ? `templates/report/items` : `templates/${type}/styles`;
    const snapshot = await adminDb.collection(collectionPath).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

async function createTemplate(type: 'docx' | 'pptx' | 'report', id: string, data: any) {
    const collectionPath = type === 'report' ? `templates/report/items` : `templates/${type}/styles`;
    const docRef = adminDb.collection(collectionPath).doc(id);
    const doc = await docRef.get();

    if (doc.exists) {
        throw new Error(`A ${type} template with this ID already exists.`);
    }

    const templateData = { ...data, id, createdAt: new Date().toISOString() };
    await docRef.set(templateData);
    return templateData;
}

async function updateTemplate(type: 'docx' | 'pptx' | 'report', id: string, data: any) {
    const collectionPath = type === 'report' ? `templates/report/items` : `templates/${type}/styles`;
    const docRef = adminDb.collection(collectionPath).doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteTemplate(type: 'docx' | 'pptx' | 'report', id: string) {
    const collectionPath = type === 'report' ? `templates/report/items` : `templates/${type}/styles`;
    await adminDb.collection(collectionPath).doc(id).delete();
    return { message: `${type} template ${id} deleted successfully` };
}

async function refreshTemplateImage(templateType: 'docx' | 'pptx', templateId: string, prompt: string) {
    const { imageUrl } = await generateImage({ flow: 'generate-image', prompt });
    if (!imageUrl) {
        throw new Error('Failed to generate a new image.');
    }
    const collectionPath = `templates/${templateType}/styles`;
    await adminDb.collection(collectionPath).doc(templateId).update({ imageUrl });
    return { imageUrl };
}

// --- DOCX Actions ---

export async function getDocxTemplatesAction() {
    return getTemplates<z.infer<typeof DocxTemplatePropertiesSchema>>('docx');
}

export async function createDocxTemplateAction(data: z.infer<typeof CreateDocxTemplateSchema>) {
    const validatedData = CreateDocxTemplateSchema.parse(data);
    const result = await createTemplate('docx', validatedData.id, validatedData);
    revalidateTag(DOCX_TEMPLATES_TAG);
    return result;
}

export async function updateDocxTemplateAction(templateId: string, data: z.infer<typeof UpdateDocxTemplateSchema>) {
    const validatedId = IdSchema.parse(templateId);
    const validatedData = UpdateDocxTemplateSchema.parse(data);
    const result = await updateTemplate('docx', validatedId, validatedData);
    revalidateTag(DOCX_TEMPLATES_TAG);
    return result;
}

export async function deleteDocxTemplateAction(templateId: string) {
    const validatedId = IdSchema.parse(templateId);
    const result = await deleteTemplate('docx', validatedId);
    revalidateTag(DOCX_TEMPLATES_TAG);
    return result;
}

// --- PPTX Actions ---

export async function getPptxTemplatesAction() {
    return getTemplates<z.infer<typeof PptxTemplatePropertiesSchema>>('pptx');
}

export async function createPptxTemplateAction(data: z.infer<typeof CreatePptxTemplateSchema>) {
    const validatedData = CreatePptxTemplateSchema.parse(data);
    const result = await createTemplate('pptx', validatedData.id, validatedData);
    revalidateTag(PPTX_TEMPLATES_TAG);
    return result;
}

export async function updatePptxTemplateAction(templateId: string, data: z.infer<typeof UpdatePptxTemplateSchema>) {
    const validatedId = IdSchema.parse(templateId);
    const validatedData = UpdatePptxTemplateSchema.parse(data);
    const result = await updateTemplate('pptx', validatedId, validatedData);
    revalidateTag(PPTX_TEMPLATES_TAG);
    return result;
}

export async function deletePptxTemplateAction(templateId: string) {
    const validatedId = IdSchema.parse(templateId);
    const result = await deleteTemplate('pptx', validatedId);
    revalidateTag(PPTX_TEMPLATES_TAG);
    return result;
}

// --- Report Generation Actions ---

export async function getReportTemplatesAction() {
    return getTemplates<z.infer<typeof ReportTemplatePropertiesSchema>>('report');
}

export async function createReportTemplateAction(data: z.infer<typeof CreateReportTemplateSchema>) {
    const validatedData = CreateReportTemplateSchema.parse(data);
    const result = await createTemplate('report', validatedData.id, validatedData);
    revalidateTag(REPORT_TEMPLATES_TAG);
    return result;
}

export async function updateReportTemplateAction(templateId: string, data: z.infer<typeof UpdateReportTemplateSchema>) {
    const validatedId = IdSchema.parse(templateId);
    const validatedData = UpdateReportTemplateSchema.parse(data);
    const result = await updateTemplate('report', validatedId, validatedData);
    revalidateTag(REPORT_TEMPLATES_TAG);
    return result;
}

export async function deleteReportTemplateAction(templateId: string) {
    const validatedId = IdSchema.parse(templateId);
    const result = await deleteTemplate('report', validatedId);
    revalidateTag(REPORT_TEMPLATES_TAG);
    return result;
}

// --- Shared Actions ---

const RefreshImageSchema = z.object({
    templateType: z.enum(['docx', 'pptx']),
    templateId: z.string(),
    prompt: z.string(),
});

export async function refreshTemplateImageAction(data: z.infer<typeof RefreshImageSchema>) {
    const validatedData = RefreshImageSchema.parse(data);
    const result = await refreshTemplateImage(validatedData.templateType, validatedData.templateId, validatedData.prompt);
    if (validatedData.templateType === 'docx') {
        revalidateTag(DOCX_TEMPLATES_TAG);
    } else {
        revalidateTag(PPTX_TEMPLATES_TAG);
    }
    return result;
}

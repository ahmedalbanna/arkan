
'use server';

import { saveTemplateHelper, getTemplateHelper } from '@/lib/firebase/db-helpers';

/**
 * Create a new template for document generation (DOCX or PPTX)
 * @param templateType - Template type: 'docx' or 'pptx'
 * @param id - Unique template ID
 * @param data - Template data containing styles and metadata
 * @returns Created template data with ID
 * @throws Error if template with same ID already exists
 */
export async function createGenerativeTemplate(
  templateType: 'docx' | 'pptx',
  id: string,
  data: Record<string, any>
): Promise<Record<string, any>> {
  try {
    // Check if template already exists
    const existingTemplate = await getTemplateHelper(id);
    if (existingTemplate) {
      throw new Error(`A ${templateType} template with this ID already exists.`);
    }

    // Save new template with type and metadata
    const templateData = {
      ...data,
      id,
      type: templateType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedTemplate = await saveTemplateHelper(templateData);
    return savedTemplate;
  } catch (error) {
    console.error(`Error creating ${templateType} template:`, error);
    throw error;
  }
}

/**
 * Retrieve a template by ID
 * @param templateId - The template ID
 * @returns Template data or null if not found
 */
export async function getTemplate(templateId: string): Promise<Record<string, any> | null> {
  try {
    return await getTemplateHelper(templateId);
  } catch (error) {
    console.error('Error retrieving template:', error);
    throw error;
  }
}

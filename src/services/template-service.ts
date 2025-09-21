'use client';

import { DocxTemplateProperties } from '@/lib/models/docxTemplate';
import { PptxTemplateProperties } from '@/lib/models/pptxTemplate';


export type DocxTemplatesRecord = Record<string, DocxTemplateProperties>;
export type PptxTemplatesRecord = Record<string, PptxTemplateProperties>;


// --- DOCX Templates ---

export async function fetchDocxTemplates(): Promise<DocxTemplatesRecord> {
  const response = await fetch("/api/admin/templates/docx");
  if (!response.ok) {
    throw new Error("Failed to fetch DOCX templates");
  }
  return await response.json();
}

export async function createDocxTemplate(data: {id: string, name: string, description: string}, token: string): Promise<DocxTemplateProperties> {
    const response = await fetch('/api/admin/templates/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return await response.json();
}


export async function updateDocxTemplate(
  variables: {key: string, styles: any},
  token: string
) {
  const response = await fetch(`/api/admin/templates/docx/${variables.key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ styles: variables.styles }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update DOCX template");
  }
  return response.json();
}

export async function deleteDocxTemplate(key: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/admin/templates/docx/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete DOCX template');
    }
    return await response.json();
}



// --- PPTX Templates ---

export async function fetchPptxTemplates(): Promise<Record<string, PptxTemplateProperties>> {
  const response = await fetch("/api/admin/templates/pptx");
  if (!response.ok) {
    throw new Error("Failed to fetch PPTX templates");
  }
  return await response.json();
}

export async function createPptxTemplate(data: {id: string, name: string, description: string}, token: string): Promise<PptxTemplateProperties> {
    const response = await fetch('/api/admin/templates/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return await response.json();
}


export async function updatePptxTemplate(
  variables: {key: string, styles?: any, templateUrl?: string},
  token: string
) {
  const response = await fetch(`/api/admin/templates/pptx/${variables.key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ styles: variables.styles, templateUrl: variables.templateUrl }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update PPTX template");
  }
  return response.json();
}

export async function deletePptxTemplate(key: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/admin/templates/pptx/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete PPTX template');
    }
    return await response.json();
}


// --- General Template Actions ---
export async function refreshTemplateImage(variables: { templateType: 'docx' | 'pptx', templateId: string, prompt: string }, token: string) {
    const response = await fetch('/api/admin/templates/refresh-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(variables)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh image');
    }
    return response.json();
}

export async function uploadPptxTemplateFile(variables: { templateId: string; file: File; token: string }) {
    const formData = new FormData();
    formData.append('file', variables.file);

    const response = await fetch(`/api/admin/templates/pptx/${variables.templateId}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${variables.token}`,
        },
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload template file');
    }
    return response.json();
}


'use client';

import { IStylesOptions } from 'docx';
import type { PptxTemplate } from '@/lib/pptx-styles';

// This file centralizes fetching and updating for generation templates.

export interface ProposalTemplate {
    id: string;
    name: string;
    description: string;
    prompt: string;
    guidelines?: string[];
}

export interface ReportGenerationTemplate {
    id: string;
    name: string;
    description: string;
    agentIds: string[]; // List of agent IDs included in this report type
}

export interface PresentationGenerationTemplate {
    id: string;
    name: string;
    description: string;
    primaryAgentId: string;
    relevantReportSectionIds?: string[];
}

export interface DocxTemplate {
    id: string;
    name: string;
    description: string;
    styles: IStylesOptions;
    imageUrl: string;
    dataAiHint: string;
}

// --- Proposal Templates ---
export async function fetchProposalTemplates(): Promise<ProposalTemplate[]> {
    const response = await fetch('/api/templates/proposal');
    if (!response.ok) {
        throw new Error('Failed to fetch proposal templates');
    }
    return await response.json();
}

export async function createProposalTemplate(data: Omit<ProposalTemplate, 'id' | 'createdAt'> & { id: string }, token: string): Promise<ProposalTemplate> {
    const response = await fetch('/api/templates/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw error; // Throw the structured error from the API
    }
    return await response.json();
}

export async function updateProposalTemplate(id: string, data: Partial<ProposalTemplate>, token: string): Promise<ProposalTemplate> {
    const response = await fetch(`/api/templates/proposal/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update proposal template');
    }
    return await response.json();
}

export async function deleteProposalTemplate(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/templates/proposal/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete proposal template');
    }
    return await response.json();
}

// --- Report Templates ---
export async function fetchReportTemplates(): Promise<ReportGenerationTemplate[]> {
    const response = await fetch('/api/templates/report');
    if (!response.ok) {
        throw new Error('Failed to fetch report templates');
    }
    return await response.json();
}

export async function createReportTemplate(data: Omit<ReportGenerationTemplate, 'createdAt'>, token: string): Promise<ReportGenerationTemplate> {
     const response = await fetch('/api/templates/report', {
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


export async function updateReportTemplate(id: string, data: Partial<ReportGenerationTemplate>, token: string): Promise<ReportGenerationTemplate> {
    const response = await fetch(`/api/templates/report/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update report template');
    }
    return await response.json();
}

export async function deleteReportTemplate(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/templates/report/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete report template');
    }
    return await response.json();
}

// --- Presentation Templates ---
export async function fetchPresentationTemplates(): Promise<PresentationGenerationTemplate[]> {
    const response = await fetch('/api/templates/presentation');
    if (!response.ok) {
        throw new Error('Failed to fetch presentation templates');
    }
    return await response.json();
}

export async function createPresentationTemplate(data: Omit<PresentationGenerationTemplate, 'createdAt'>, token: string): Promise<PresentationGenerationTemplate> {
     const response = await fetch('/api/templates/presentation', {
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

export async function updatePresentationTemplate(id: string, data: Partial<PresentationGenerationTemplate>, token: string): Promise<PresentationGenerationTemplate> {
    const response = await fetch(`/api/templates/presentation/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update presentation template');
    }
    return await response.json();
}

export async function deletePresentationTemplate(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/templates/presentation/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete presentation template');
    }
    return await response.json();
}


// --- DOCX Templates ---

export async function fetchDocxTemplates(): Promise<Record<string, DocxTemplate>> {
  const response = await fetch("/api/templates/docx");
  if (!response.ok) {
    throw new Error("Failed to fetch DOCX templates");
  }
  return await response.json();
}

export async function createDocxTemplate(data: {id: string, name: string, description: string}, token: string): Promise<DocxTemplate> {
    const response = await fetch('/api/templates/docx', {
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
  const response = await fetch(`/api/templates/docx/${variables.key}`, {
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

export async function deleteDocxTemplate(templateKey: string, token: string) {
    const response = await fetch(`/api/templates/docx/${templateKey}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete template');
    }
    return response.json();
}

// --- PPTX Templates ---
export async function fetchPptxTemplates(): Promise<Record<string, PptxTemplate>> {
  const response = await fetch("/api/templates/pptx");
  if (!response.ok) {
    throw new Error("Failed to fetch PPTX templates");
  }
  return await response.json();
}

export async function createPptxTemplate(data: {id: string, name: string, description: string}, token: string): Promise<PptxTemplate> {
    const response = await fetch('/api/templates/pptx', {
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
  variables: {key: string, styles: any},
  token: string
) {
  const response = await fetch(`/api/templates/pptx/${variables.key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ styles: variables.styles }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update PPTX template");
  }
  return response.json();
}

export async function deletePptxTemplate(templateKey: string, token: string) {
    const response = await fetch(`/api/templates/pptx/${templateKey}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete template');
    }
    return response.json();
}


export async function refreshTemplateImage(
  variables: { templateType: string; templateId: string; prompt: string },
  token: string
) {
  const response = await fetch("/api/templates/refresh-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to refresh image");
  }
  return response.json();
}

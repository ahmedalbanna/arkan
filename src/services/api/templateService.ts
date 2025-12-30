
'use client';

import type { CreatePresentationTemplateData, CreateReportTemplateData, DocxTemplateProperties, PptxTemplateProperties, PresentationTemplateProperties, ProjectProperties, ReportTemplateProperties, UpdatePresentationTemplateData, UpdateReportTemplateData } from '@/lib/models';


// ============================================================================
// DOCX TEMPLATES
// ============================================================================

export async function fetchDocxTemplatesApi(): Promise<Record<string, DocxTemplateProperties>> {
    const response = await fetch('/api/templates/docx');
    if (!response.ok) throw new Error('Failed to fetch DOCX templates');
    return response.json();
}

export async function updateDocxTemplateApi(key: string, data: { styles: any }, token: string): Promise<DocxTemplateProperties> {
    const response = await fetch(`/api/templates/docx/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function deleteDocxTemplateApi(key: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/templates/docx/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function createDocxTemplateApi(data: { id: string; name: string; description: string }, token: string): Promise<DocxTemplateProperties> {
    const response = await fetch('/api/templates/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}


// ============================================================================
// PPTX TEMPLATES
// ============================================================================

export async function fetchPptxTemplatesApi(): Promise<Record<string, PptxTemplateProperties>> {
    const response = await fetch('/api/templates/pptx');
    if (!response.ok) throw new Error('Failed to fetch PPTX templates');
    return response.json();
}

export async function updatePptxTemplateApi(key: string, data: { styles: any }, token: string): Promise<PptxTemplateProperties> {
    const response = await fetch(`/api/templates/pptx/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function deletePptxTemplateApi(key: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/templates/pptx/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function createPptxTemplateApi(data: { id: string; name: string; description: string }, token: string): Promise<PptxTemplateProperties> {
    const response = await fetch('/api/templates/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}


// ============================================================================
// REPORT GENERATION TEMPLATES
// ============================================================================

export async function fetchReportTemplatesApi(): Promise<ReportTemplateProperties[]> {
    const response = await fetch('/api/templates/report');
    if (!response.ok) throw new Error('Failed to fetch report templates');
    return response.json();
}

export async function applyReportTemplateApi(variables: { project: ProjectProperties; template: ReportTemplateProperties; token: string }): Promise<ProjectProperties> {
    const { project, template, token } = variables;
    const response = await fetch('/api/templates/report/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ project, template }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply template.');
    }
    return response.json();
}


export async function createReportTemplateApi(data: CreateReportTemplateData, token: string): Promise<ReportTemplateProperties> {
    const response = await fetch('/api/admin/templates/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create report template.');
    }
    return response.json();
}

export async function updateReportTemplateApi(templateId: string, data: UpdateReportTemplateData, token: string): Promise<ReportTemplateProperties> {
    const response = await fetch(`/api/admin/templates/report/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update report template.');
    }
    return response.json();
}

export async function deleteReportTemplateApi(templateId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/admin/templates/report/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete report template.');
    }
    return response.json();
}

// ============================================================================
// PRESENTATION GENERATION TEMPLATES
// ============================================================================

export async function fetchPresentationTemplatesApi(): Promise<PresentationTemplateProperties[]> {
    const response = await fetch('/api/templates/presentation');
    if (!response.ok) throw new Error('Failed to fetch presentation templates');
    return response.json();
}

export async function createPresentationTemplateApi(data: CreatePresentationTemplateData, token: string): Promise<PresentationTemplateProperties> {
    const response = await fetch('/api/admin/templates/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create presentation template.');
    }
    return response.json();
}

export async function updatePresentationTemplateApi(templateId: string, data: UpdatePresentationTemplateData, token: string): Promise<PresentationTemplateProperties> {
    const response = await fetch(`/api/admin/templates/presentation/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update presentation template.');
    }
    return response.json();
}

export async function deletePresentationTemplateApi(templateId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/admin/templates/presentation/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete presentation template.');
    }
    return response.json();
}


export async function refreshTemplateImage(
    variables: { templateType: 'docx' | 'pptx', templateId: string, prompt: string },
    token: string
): Promise<any> {
    const response = await fetch('/api/templates/refresh-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variables),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh image.');
    }
    return response.json();
}

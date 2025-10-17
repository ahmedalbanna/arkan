/**
 * خدمة القوالب
 *
 * هذا الملف يحتوي على خدمات إدارة القوالب المختلفة
 */

'use client';

import type { ProposalTemplateProperties } from "@/lib/models/proposalTemplate";
import type { DocxTemplateProperties, PptxTemplateProperties, ReportTemplateProperties } from "@/lib/types";

// === DOCX ===
export async function fetchDocxTemplatesApi(): Promise<Record<string, DocxTemplateProperties>> {
    const response = await fetch('/api/admin/templates/docx');
    if (!response.ok) throw new Error('Failed to fetch DOCX templates');
    return response.json();
}
export async function updateDocxTemplateApi(variables: { key: string, styles: any }, token: string) {
    const response = await fetch(`/api/admin/templates/docx/${variables.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ styles: variables.styles }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to update DOCX template');
    return response.json();
}

// === PPTX ===
export async function fetchPptxTemplatesApi(): Promise<Record<string, PptxTemplateProperties>> {
    const response = await fetch('/api/admin/templates/pptx');
    if (!response.ok) throw new Error('Failed to fetch PPTX templates');
    return response.json();
}
export async function updatePptxTemplateApi(variables: { key: string, styles: any }, token: string) {
    const response = await fetch(`/api/admin/templates/pptx/${variables.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ styles: variables.styles }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to update PPTX template');
    return response.json();
}
export async function deletePptxTemplateApi(templateId: string, token: string) {
    const response = await fetch(`/api/admin/templates/pptx/${templateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete PPTX template');
    return response.json();
}
export async function uploadPptxTemplateFileApi(templateId: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/admin/templates/pptx/${templateId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to upload PPTX template file');
    return response.json();
}


// === Proposal ===
export async function fetchProposalTemplatesApi(): Promise<ProposalTemplateProperties[]> {
    const response = await fetch('/api/templates/proposal');
    if (!response.ok) throw new Error('Failed to fetch proposal templates');
    return response.json();
}
export async function updateProposalTemplateApi(templateId: string, data: Partial<ProposalTemplateProperties>, token: string) {
    // This needs a specific API endpoint, assuming it exists at:
    const response = await fetch(`/api/admin/templates/proposal/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to update proposal template');
    return response.json();
}


// === Report ===
export async function fetchReportTemplatesApi(): Promise<ReportTemplateProperties[]> {
    const response = await fetch('/api/templates/report');
    if (!response.ok) throw new Error('Failed to fetch report templates');
    return response.json();
}
export async function updateReportTemplateApi(templateId: string, data: Partial<ReportTemplateProperties>, token: string) {
    const response = await fetch(`/api/admin/templates/report/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to update report template');
    return response.json();
}


// === Presentation ===
export async function fetchPresentationTemplatesApi(): Promise<any[]> {
    const response = await fetch('/api/templates/presentation');
    if (!response.ok) throw new Error('Failed to fetch presentation templates');
    return response.json();
}
export async function updatePresentationTemplateApi(templateId: string, data: Partial<any>, token: string) {
    const response = await fetch(`/api/admin/templates/presentation/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Failed to update presentation template');
    return response.json();
}
export async function createGenerativeTemplate(templateType: string, id: string, data: any, token: string) {
    const response = await fetch(`/api/admin/templates/${templateType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error((await response.json()).message || `Failed to create ${templateType} template`);
    return response.json();
}

// === Image Refresh ===
export async function refreshTemplateImage(variables: { templateType: string, templateId: string, prompt: string }, token: string) {
    const response = await fetch('/api/admin/templates/refresh-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(variables),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh template image');
    }
    return response.json();
}

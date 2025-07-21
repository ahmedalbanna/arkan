
'use client';

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
    agentIds: string[];
}

export interface PresentationGenerationTemplate {
    id: string;
    name: string;
    description: string;
    primaryAgentId: string;
    relevantReportSectionIds?: string[];
}

// Fetch Proposal Templates
export async function fetchProposalTemplates(): Promise<ProposalTemplate[]> {
    const response = await fetch('/api/templates/proposal');
    if (!response.ok) {
        throw new Error('Failed to fetch proposal templates');
    }
    return await response.json();
}

// Update Proposal Template
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

// Fetch Report Templates
export async function fetchReportTemplates(): Promise<ReportGenerationTemplate[]> {
    const response = await fetch('/api/templates/report');
    if (!response.ok) {
        throw new Error('Failed to fetch report templates');
    }
    return await response.json();
}

// Update Report Template
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

// Fetch Presentation Templates
export async function fetchPresentationTemplates(): Promise<PresentationGenerationTemplate[]> {
    const response = await fetch('/api/templates/presentation');
    if (!response.ok) {
        throw new Error('Failed to fetch presentation templates');
    }
    return await response.json();
}

// Update Presentation Template
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

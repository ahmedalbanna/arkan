/**
 * خدمة إدارة الأقسام
 *
 * هذا الملف يحتوي على خدمات إدارة أقسام التقارير والمخططات والعروض
 */

// C:\Users\ahmed\source\repos\arkan\src\services\section-service.ts
'use client';

import { SectionProperties } from "@/lib/models/section";



export async function fetchSections(token: string): Promise<SectionProperties[]> {
    const response = await fetch('/api/admin/sections', {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch sections');
    return response.json();
}

export async function createSection(data: Omit<SectionProperties, 'id'> & { id: string }, token: string): Promise<SectionProperties> {
    const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create section');
    }
    return response.json();
}

export async function updateSection(sectionId: string, data: Partial<SectionProperties>, token: string): Promise<SectionProperties> {
    const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update section');
    }
    return response.json();
}

export async function deleteSection(sectionId: string, token: string): Promise<void> {
    const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete section');
    }
}

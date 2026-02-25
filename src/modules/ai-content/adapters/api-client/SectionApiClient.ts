
'use client';

import { SectionProperties } from "@/lib/types";
import { apiService } from "@/infrastructure/api/ApiService";

export async function fetchSections(token: string): Promise<SectionProperties[]> {
  return apiService({ endpoint: '/api/admin/sections', token });
}

export async function createSection(data: Omit<SectionProperties, 'id'> & { id: string }, token: string): Promise<SectionProperties> {
  return apiService({
    endpoint: '/api/admin/sections',
    method: 'POST',
    data,
    token
  });
}

export async function updateSection(sectionId: string, data: Partial<SectionProperties>, token: string): Promise<SectionProperties> {
  return apiService({
    endpoint: `/api/admin/sections/${sectionId}`,
    method: 'PUT',
    data,
    token
  });
}

export async function deleteSection(sectionId: string, token: string): Promise<void> {
  return apiService({
    endpoint: `/api/admin/sections/${sectionId}`,
    method: 'DELETE',
    token
  });
}

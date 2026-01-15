
'use client';

import type { ProjectProperties } from "@/lib/models";
import { apiService } from "./apiService";

export async function fetchProjectsApi(token: string): Promise<ProjectProperties[]> {
    return apiService({ endpoint: '/api/projects', token });
}

export async function fetchProjectByIdApi(id: string, token: string): Promise<ProjectProperties> {
    // Note: The backend getProject requires userId, but client-side doesn't know other user's IDs.
    // This API call implies fetching the current user's project. The backend will use the authenticated user's ID.
    return apiService({ endpoint: `/api/projects/${id}`, token });
}

export async function saveProjectApi(data: ProjectProperties, token: string): Promise<ProjectProperties> {
    return apiService({
      endpoint: '/api/projects',
      method: 'POST',
      data,
      token
    });
}

export async function deleteProjectApi(id: string, token: string): Promise<{ message: string }> {
    return apiService({
      endpoint: `/api/projects/${id}`,
      method: 'DELETE',
      token
    });
}

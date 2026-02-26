
'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";
import { SectionProperties } from "@/lib/types";
import { apiService } from "@/infrastructure/api/ApiService";

@injectable()
export class SectionApiClient {
  async fetchSections(token: string): Promise<SectionProperties[]> {
    return apiService({ endpoint: '/api/admin/sections', token });
  }

  async createSection(data: Omit<SectionProperties, 'id'> & { id: string }, token: string): Promise<SectionProperties> {
    return apiService({
      endpoint: '/api/admin/sections',
      method: 'POST',
      data,
      token
    });
  }

  async updateSection(sectionId: string, data: Partial<SectionProperties>, token: string): Promise<SectionProperties> {
    return apiService({
      endpoint: `/api/admin/sections/${sectionId}`,
      method: 'PUT',
      data,
      token
    });
  }

  async deleteSection(sectionId: string, token: string): Promise<void> {
    return apiService({
      endpoint: `/api/admin/sections/${sectionId}`,
      method: 'DELETE',
      token
    });
  }
}

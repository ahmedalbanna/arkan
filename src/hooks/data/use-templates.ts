'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/util/use-toast';
import { TemplateApiClient } from '@/modules/templates/adapters/api-client/TemplateApiClient';
import { useBuilderStore } from '../core/useBuilderStore';
import { useState } from 'react';
import { applyReportTemplate as applyReportTemplateUtil } from '@/lib/project/template';
import {
  CreateReportTemplateData,
  ReportTemplateProperties,
  UpdateReportTemplateData,
} from '@/modules/templates/domain/entities/ReportTemplate';
import { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';
import type { BaseTemplateProperties } from '@/modules/templates/domain/entities/Template';
import { runAuthenticatedResultCall, unwrapResult } from './authenticated-client-call';
import { templateKeys } from '@/lib/query-keys';

export function useReportTemplates() {
  return useQuery<ReportTemplateProperties[]>({
    queryKey: templateKeys.report(),
    queryFn: async () => unwrapResult(await new TemplateApiClient().fetchReportTemplatesApi()),
    staleTime: 1000 * 60 * 60,
  });
}

export function useApplyReportTemplate(onSuccessCallback?: () => void) {
  const { project, updateProject } = useBuilderStore();
  const [isApplying, setIsApplying] = useState(false);

  const handleSelectTemplate = (template: ReportTemplateProperties) => {
    if (!project) {
      toast({ title: 'Error', description: 'Project data not available.', variant: 'destructive' });
      return;
    }

    setIsApplying(true);
    try {
      updateProject((currentProject) => applyReportTemplateUtil(currentProject, template));
      toast({ title: 'Template Applied', description: `Project structured with '${template.name}'.` });
      onSuccessCallback?.();
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : 'Failed to apply template';
      toast({ title: 'Failed to Apply Template', description, variant: 'destructive' });
    } finally {
      setIsApplying(false);
    }
  };

  return {
    handleSelectTemplate,
    isApplyingTemplate: isApplying,
  };
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateReportTemplateData) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.createReportTemplateApi(data, token),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templateKeys.report() }),
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Creation failed';
      toast({ title: 'Creation Failed', description, variant: 'destructive' });
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: UpdateReportTemplateData }) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.updateReportTemplateApi(templateId, data, token),
      ),
    onSuccess: () => {
      toast({ title: 'Template Updated', description: 'Report template has been saved.' });
      queryClient.invalidateQueries({ queryKey: templateKeys.report() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Update failed';
      toast({ title: 'Update Failed', description, variant: 'destructive' });
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (templateId: string) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.deleteReportTemplateApi(templateId, token),
      ),
    onSuccess: () => {
      toast({ title: 'Template Deleted' });
      queryClient.invalidateQueries({ queryKey: templateKeys.report() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Delete failed';
      toast({ title: 'Delete Failed', description, variant: 'destructive' });
    },
  });
}

export function usePresentationTemplates() {
  return useQuery<PptxTemplateProperties[]>({
    queryKey: templateKeys.presentation(),
    queryFn: async () => unwrapResult(await new TemplateApiClient().fetchPresentationTemplatesApi()),
  });
}

export function useCreatePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: BaseTemplateProperties) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.createPresentationTemplateApi(data, token),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templateKeys.presentation() }),
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Creation failed';
      toast({ title: 'Creation Failed', description, variant: 'destructive' });
    },
  });
}

export function useUpdatePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: Partial<BaseTemplateProperties> }) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.updatePresentationTemplateApi(templateId, data, token),
      ),
    onSuccess: () => {
      toast({ title: 'Template Updated', description: 'Presentation template has been saved.' });
      queryClient.invalidateQueries({ queryKey: templateKeys.presentation() });
      queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Update failed';
      toast({ title: 'Update Failed', description, variant: 'destructive' });
    },
  });
}

export function useDeletePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (templateId: string) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.deletePresentationTemplateApi(templateId, token),
      ),
    onSuccess: () => {
      toast({ title: 'Template Deleted' });
      queryClient.invalidateQueries({ queryKey: templateKeys.presentation() });
      queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Delete failed';
      toast({ title: 'Delete Failed', description, variant: 'destructive' });
    },
  });
}

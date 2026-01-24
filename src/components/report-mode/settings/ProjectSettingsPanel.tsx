'use client';

import { Form } from '@/components/ui/form';
import { useBuilderStore } from '@/hooks';
import { useImageUpload } from '@/hooks/core/useImageUpload';
import type { ProjectProperties } from '@/lib/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { BehaviorsForm, LogoUploadSection, ProjectMetadataForm, WritingStyleForm } from './components';
import { settingsSchema, type SettingsFormValues } from './types';

/**
 * ProjectSettingsPanel Component
 *
 * Main container for project settings. Manages form state and delegates
 * rendering to specialized sub-components for better maintainability.
 *
 * Refactored from 463 lines to ~150 lines by extracting:
 * - TagInput → components/TagInput.tsx
 * - ProjectMetadataForm → components/ProjectMetadataForm.tsx
 * - WritingStyleForm → components/WritingStyleForm.tsx
 * - BehaviorsForm → components/BehaviorsForm.tsx
 * - LogoUploadSection → components/LogoUploadSection.tsx
 * - Constants → constants.ts
 * - Types → types.ts
 */
export default function ProjectSettingsPanel() {
  const { project, updateProject } = useBuilderStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { isUploading, handleFileUpload } = useImageUpload();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      projectDescription: '',
      projectType: '',
      specialization: '',
      university: '',
      supervisor: '',
      course: '',
      educationalLevel: '',
      teamMembers: '',
      language: 'default',
      complexity: 50,
      formality: 70,
      tone: 'professional',
      behaviors: [],
      rules: [],
      constraints: [],
      citationStyle: 'APA7',
    }
  });

  // Sync form with project data
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || '',
        projectDescription: project.projectDescription || '',
        projectType: project.projectType || '',
        specialization: project.specialization || '',
        university: project.university || '',
        supervisor: project.supervisor || '',
        course: project.course || '',
        educationalLevel: project.educationalLevel || '',
        teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : '',
        language: project.language || 'default',
        complexity: project.complexity ?? 50,
        formality: project.formality ?? 70,
        tone: project.tone || 'professional',
        behaviors: project.behaviors ? [...project.behaviors] : [],
        rules: project.rules ? [...project.rules] : [],
        constraints: project.constraints ? [...project.constraints] : [],
        citationStyle: project.citationStyle || 'APA7',
      });
      setLogoPreview(project.logoUrl || null);
    }
  }, [project, form]);

  // Auto-save on blur
  const handleBlur = () => {
    const data = form.getValues();
    const updateData: Partial<ProjectProperties> = {
      name: data.name,
      projectDescription: data.projectDescription,
      projectType: data.projectType,
      specialization: data.specialization,
      university: data.university,
      supervisor: data.supervisor,
      course: data.course,
      educationalLevel: data.educationalLevel,
      teamMembers: data.teamMembers ? data.teamMembers.split(',').map(m => m.trim()) : [],
      language: data.language,
      complexity: data.complexity,
      formality: data.formality,
      tone: data.tone as any,
      behaviors: data.behaviors,
      rules: data.rules,
      constraints: data.constraints,
      citationStyle: data.citationStyle,
    };

    updateProject(p => p.with(updateData));
  };

  // Logo upload handlers
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    const imageUrl = await handleFileUpload(file, project.id);
    if (imageUrl) {
      setLogoPreview(imageUrl);
      updateProject(p => p.with({ logoUrl: imageUrl }));
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateProject(p => p.with({ logoUrl: undefined }));
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>
          Manage the metadata for your project. This information will automatically update the cover page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <Form {...form}>
          <form className="space-y-4 h-full flex flex-col">
            <ScrollArea className="flex-grow pr-4 -mr-4">
              <div className="space-y-4">
                {/* Logo Upload */}
                <LogoUploadSection
                  logoPreview={logoPreview}
                  isUploading={isUploading}
                  onFileChange={handleLogoChange}
                  onRemoveLogo={handleRemoveLogo}
                />

                {/* Project Metadata */}
                <ProjectMetadataForm form={form} onBlur={handleBlur} />

                {/* Writing Style */}
                <WritingStyleForm form={form} onBlur={handleBlur} />

                {/* Behaviors & Constraints */}
                <BehaviorsForm form={form} onBlur={handleBlur} />
              </div>
            </ScrollArea>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

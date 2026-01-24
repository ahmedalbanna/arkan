// @ts-nocheck
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { educationalLevelOptions, projectTypeOptions, specializationOptions, universityOptions } from '../constants';
import type { SettingsFormValues } from '../types';

interface ProjectMetadataFormProps {
  form: UseFormReturn<SettingsFormValues>;
  onBlur: () => void;
}

/**
 * ProjectMetadataForm Component
 *
 * Handles basic project information fields like name, description, type, etc.
 */
export function ProjectMetadataForm({ form, onBlur }: ProjectMetadataFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Metadata</CardTitle>
        <CardDescription>Basic information about your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name *</FormLabel>
              <FormControl>
                <Input {...field} onBlur={onBlur} placeholder="e.g., AI-Powered Healthcare System" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea {...field} onBlur={onBlur} placeholder="Brief description of your project..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <FormControl>
                <CustomSelect
                  {...field}
                  onValueChange={(value: string) => { field.onChange(value); onBlur(); }}
                  options={projectTypeOptions}
                  placeholder="Select project type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field / Specialization</FormLabel>
              <FormControl>
                <CustomSelect
                  {...field}
                  onValueChange={(value: string) => { field.onChange(value); onBlur(); }}
                  options={specializationOptions}
                  placeholder="Select specialization"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="educationalLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Educational Level</FormLabel>
              <FormControl>
                <CustomSelect
                  {...field}
                  onValueChange={(value: string) => { field.onChange(value); onBlur(); }}
                  options={educationalLevelOptions}
                  placeholder="Select level"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University / Institution</FormLabel>
              <FormControl>
                <CustomSelect
                  {...field}
                  onValueChange={(value: string) => { field.onChange(value); onBlur(); }}
                  options={universityOptions}
                  placeholder="Select university"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor / Advisor</FormLabel>
              <FormControl>
                <Input {...field} onBlur={onBlur} placeholder="Dr. John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course / Module</FormLabel>
              <FormControl>
                <Input {...field} onBlur={onBlur} placeholder="e.g., CS-501" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamMembers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Members</FormLabel>
              <FormControl>
                <Input {...field} onBlur={onBlur} placeholder="Comma-separated names" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

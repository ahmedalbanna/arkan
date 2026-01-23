'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import type { SettingsFormValues } from '../types';
import { LanguageSchema } from '@/lib/models';
import { citationStyleOptions } from '../constants';

// Tone options (replace with actual enum if available)
const toneOptions = ['professional', 'academic', 'casual', 'persuasive', 'technical', 'explanatory'] as const;

interface WritingStyleFormProps {
  form: UseFormReturn<SettingsFormValues>;
  onBlur: () => void;
}

/**
 * WritingStyleForm Component
 * 
 * Handles writing style configurations like language, tone, formality, etc.
 */
export function WritingStyleForm({ form, onBlur }: WritingStyleFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Writing Style & Configuration</CardTitle>
        <CardDescription>Define the tone, language, and style of your report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={(value) => { field.onChange(value); onBlur(); }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LanguageSchema.options.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Select onValueChange={(value) => { field.onChange(value); onBlur(); }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formality"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Formality</FormLabel>
                <Badge variant="outline">{field.value}%</Badge>
              </div>
              <FormControl>
                <Slider
                  value={[field.value ?? 50]}
                  onValueChange={(v) => field.onChange(v[0])}
                  onBlur={onBlur}
                  min={0}
                  max={100}
                  step={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complexity"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Complexity</FormLabel>
                <Badge variant="outline">{field.value}%</Badge>
              </div>
              <FormControl>
                <Slider
                  value={[field.value ?? 50]}
                  onValueChange={(v) => field.onChange(v[0])}
                  onBlur={onBlur}
                  min={0}
                  max={100}
                  step={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="citationStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Citation Style</FormLabel>
              <Select onValueChange={(value) => { field.onChange(value); onBlur(); }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select citation style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {citationStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

'use client';

import { Controller, UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Trash2 } from 'lucide-react';
import type { SettingsFormValues } from '../types';
import { TagInput } from './TagInput';
import { FormField } from '@/components/ui/form';

interface BehaviorsFormProps {
  form: UseFormReturn<SettingsFormValues>;
  onBlur: () => void;
}

/**
 * BehaviorsForm Component
 * 
 * Handles AI behaviors, personas, rules, and constraints configuration.
 */
export function BehaviorsForm({ form, onBlur }: BehaviorsFormProps) {
  const { fields: behaviors, append: appendBehavior, remove: removeBehavior } = useFieldArray({
    control: form.control,
    name: 'behaviors',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Behaviors & Constraints</CardTitle>
        <CardDescription>Define how the AI should behave and what constraints to follow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Behaviors & Personas</Label>
          <div className="space-y-2">
            {behaviors.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 rounded-md border p-2 bg-muted/50">
                <Input
                  {...form.register(`behaviors.${index}.name`)}
                  onBlur={onBlur}
                  placeholder="e.g., 'Act as an expert academic writer'"
                  className="flex-grow bg-background border-transparent focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Controller
                  control={form.control}
                  name={`behaviors.${index}.type`}
                  render={({ field }) => (
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                          onBlur();
                        }
                      }}
                      className="shrink-0"
                      size="sm"
                    >
                      <ToggleGroupItem value="persona">Persona</ToggleGroupItem>
                      <ToggleGroupItem value="behavior">Behavior</ToggleGroupItem>
                    </ToggleGroup>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeBehavior(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => appendBehavior({ name: '', type: 'behavior' })}
          >
            Add Behavior
          </Button>
        </div>

        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <TagInput
              label="Mandatory Rules"
              placeholder="Add a rule and press Enter"
              value={field.value || []}
              onChange={(value) => {
                field.onChange(value);
                onBlur();
              }}
            />
          )}
        />

        <FormField
          control={form.control}
          name="constraints"
          render={({ field }) => (
            <TagInput
              label="Constraints / What to Avoid"
              placeholder="Add a constraint and press Enter"
              value={field.value || []}
              onChange={(value) => {
                field.onChange(value);
                onBlur();
              }}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}

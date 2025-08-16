
'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { AgentEditorFormValues } from '@/components/admin/agent-editor/AgentEditor';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';

export default function GuidelinesTab({ isComplexPrompt }: { isComplexPrompt: boolean }) {
  const { control } = useFormContext<AgentEditorFormValues>();
  const { t } = useLocalization();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prompt.guidelines',
  });

  if (!isComplexPrompt) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="font-semibold">{t('agentEditor.complexPromptNote')}</p>
            <p>Guidelines can only be added to agents with a complex prompt (base + guidelines). This agent uses a simple string prompt.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <CardTitle>{t('agentEditor.guidelinesTitle')}</CardTitle>
      <p className="text-sm text-muted-foreground">
        {t('agentEditor.guidelinesDesc')}
      </p>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <Textarea
              {...control.register(`prompt.guidelines.${index}.text`)}
              rows={2}
              className="flex-grow"
              placeholder="e.g., Always respond in a friendly and professional tone."
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

       <Button
        type="button"
        variant="outline"
        onClick={() => append({ text: '', isDefault: false })}
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Guideline
      </Button>
    </div>
  );
}

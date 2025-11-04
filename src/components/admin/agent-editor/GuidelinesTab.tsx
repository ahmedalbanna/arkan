

'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { AgentEditorFormValues } from '@/lib/schemas/agent-editor-schema';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';

export default function GuidelinesTab() {
  const { control } = useFormContext<AgentEditorFormValues>();
  const { t } = useLocalization();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guidelines',
  });

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
              {...control.register(`guidelines.${index}`)}
              rows={2}
              className="flex-grow"
              placeholder={t('agentEditor.guidelinePlaceholder')}
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
        onClick={() => append('')} // Append an empty string for the new guideline
        className="w-full justify-start"
      >
        <Plus className="me-2 h-4 w-4" />
        {t('agentEditor.addGuideline')}
      </Button>
    </div>
  );
}

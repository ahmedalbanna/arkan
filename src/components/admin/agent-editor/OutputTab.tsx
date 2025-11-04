
'use client';

import { useFormContext } from 'react-hook-form';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { CardTitle } from '@/components/ui/card';
import { AlertCircle, PlusCircle } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { AgentEditorFormValues } from '@/hooks/admin/use-agent-editor';


const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

export default function OutputTab() {
  const { resolvedTheme } = useTheme();
  const { watch, setValue } = useFormContext<AgentEditorFormValues>();
  const { t } = useLocalization();

  // The 'prompt' field no longer contains the jsonStructure.
  // This tab would need to be re-thought if JSON output configuration is required.
  // For now, we will show a placeholder.

  return (
    <div className="space-y-6">
      <CardTitle>{t('agentEditor.outputTitle')}</CardTitle>
      <p className="text-sm text-muted-foreground">
        {t('agentEditor.outputDesc')}
      </p>

      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border rounded-lg">
          <AlertCircle className="h-10 w-10 mb-4" />
          <p className="font-semibold">JSON Output Configuration Unavailable</p>
          <p>Defining a structured JSON output is now handled directly within the agent's prompt instructions.</p>
      </div>

    </div>
  );
}

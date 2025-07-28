
'use client';

import { useFormContext } from 'react-hook-form';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { AgentEditorFormValues } from './AgentEditor';
import type { AgentPrompt } from '@/lib/agents';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

interface OutputTabProps {
  isComplexPrompt: boolean;
}

export default function OutputTab({ isComplexPrompt }: OutputTabProps) {
  const { resolvedTheme } = useTheme();
  const { watch } = useFormContext<AgentEditorFormValues>();

  const promptValue = watch('prompt') as AgentPrompt;
  const jsonStructure = promptValue?.jsonStructure;
  
  if (!isComplexPrompt) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="font-semibold">Not a Complex Prompt</p>
            <p>JSON output structures can only be defined for agents with a complex prompt.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <CardTitle>Output</CardTitle>
      <p className="text-sm text-muted-foreground">
        Define the expected JSON structure for the agent's output. This ensures consistent, machine-readable responses from the AI.
      </p>

      <div className="p-4 border rounded-md bg-background">
        {jsonStructure ? (
          <ReactJson 
            src={jsonStructure} 
            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
            displayDataTypes={false}
            name={false}
            quotesOnKeys={false}
            displayObjectSize={false}
            onEdit={false}
            onDelete={false}
          />
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>No JSON structure defined for this agent's prompt.</p>
            </div>
        )}
      </div>
    </div>
  );
}

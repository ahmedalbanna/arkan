
'use client';

import { useFormContext } from 'react-hook-form';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { CardTitle } from '@/components/ui/card';
import { AlertCircle, PlusCircle } from 'lucide-react';
import type { AgentEditorFormValues } from '@/components/admin/agent-editor/AgentEditor';
import type { AgentPrompt } from '@/lib/agents';
import { Button } from '@/components/ui/button';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

interface OutputTabProps {
  isComplexPrompt: boolean;
}

export default function OutputTab({ isComplexPrompt }: OutputTabProps) {
  const { resolvedTheme } = useTheme();
  const { watch, setValue } = useFormContext<AgentEditorFormValues>();

  const promptValue = watch('prompt') as AgentPrompt;
  const jsonStructure = promptValue?.jsonStructure;
  
  const handleCreateStructure = () => {
    // Sets an empty object to start building the structure
    setValue('prompt.jsonStructure', {}, { shouldDirty: true });
  }

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

      <div className="p-4 border rounded-md bg-background min-h-[200px]">
        {jsonStructure ? (
          <ReactJson 
            src={jsonStructure} 
            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
            displayDataTypes={false}
            name={false}
            quotesOnKeys={false}
            displayObjectSize={false}
            onEdit={({ updated_src }) => setValue('prompt.jsonStructure', updated_src, { shouldDirty: true })}
            onAdd={({ updated_src }) => setValue('prompt.jsonStructure', updated_src, { shouldDirty: true })}
            onDelete={({ updated_src }) => setValue('prompt.jsonStructure', updated_src, { shouldDirty: true })}
          />
        ) : (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center">
                <p className="mb-4">No JSON structure defined for this agent's prompt.</p>
                <Button variant="outline" onClick={handleCreateStructure}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Structure
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

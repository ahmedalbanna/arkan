
'use client';

import { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { AlertCircle, Search } from 'lucide-react';
import type { Agent } from '@/lib/types';
import type { AgentEditorFormValues } from '@/lib/agent-editor-schema';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';

function ContextSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-48" />
            </div>
             <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-40" />
            </div>
             <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-52" />
            </div>
        </div>
    )
}

interface ContextTabProps {
    allAgents: Agent[];
}

export default function ContextTab({ allAgents }: ContextTabProps) {
  const { control } = useFormContext<AgentEditorFormValues>();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLocalization();

  const filteredAgents = useMemo(() => {
    if (!allAgents) return [];
    return allAgents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAgents, searchTerm]);

  return (
    <div className="space-y-6">
      <CardTitle>{t('agentEditor.contextTitle')}</CardTitle>
      <p className="text-sm text-muted-foreground">
        {t('agentEditor.contextDesc')}
      </p>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={t('agentEditor.searchAgentsPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
            />
        </div>

        <h3 className="font-semibold text-sm pt-2">{t('agentEditor.availableAgentsLabel')}</h3>
         {!allAgents ? <ContextSkeleton /> : (
            <FormField
                control={control}
                name="prompt.defaultContext"
                render={() => (
                    <FormItem>
                         <div className="grid grid-cols-2 gap-4">
                            {filteredAgents.map((agent) => (
                                <FormField
                                    key={agent.id}
                                    control={control}
                                    name="prompt.defaultContext"
                                    render={({ field }) => {
                                        const Icon = allAgents.find(a => a.id === agent.id)?.icon || AlertCircle;
                                        return (
                                            <FormItem key={agent.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(agent.id)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValue = field.value || [];
                                                            return checked
                                                                ? field.onChange([...currentValue, agent.id])
                                                                : field.onChange(currentValue?.filter((value) => value !== agent.id));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {agent.name}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </FormItem>
                )}
            />
        )}
      </div>
    </div>
  );
}

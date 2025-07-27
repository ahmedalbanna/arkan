
'use client';

import { CardTitle } from '@/components/ui/card';
import { useAgents } from '@/hooks/use-agents';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

export default function ContextTab() {
  const { agents, isLoaded } = useAgents();

  return (
    <div className="space-y-6">
      <CardTitle>Share Context</CardTitle>
      <p className="text-sm text-muted-foreground">
        Select other agents whose output should be available as context when running this agent. This allows you to chain agent actions together.
      </p>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Available Agents</h3>
         {!isLoaded ? <ContextSkeleton /> : (
            <div className="grid grid-cols-2 gap-4">
                {agents.map(({ id, name, icon: Icon }) => (
                    <div key={id} className="flex items-center space-x-2">
                        <Checkbox id={`agent-context-${id}`} />
                        <Label htmlFor={`agent-context-${id}`} className="font-normal flex items-center gap-2">
                           <Icon className="h-4 w-4" />
                           {name}
                        </Label>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

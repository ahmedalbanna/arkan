
'use client';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Plus, Info } from 'lucide-react';
import { CreateCommandDialog } from './CreateCommandDialog';

export default function CommandsTab() {
  return (
    <div className="space-y-6">
      <CardTitle>Commands</CardTitle>
      <p className="text-sm text-muted-foreground">
        Create custom commands as advanced prompts for AI Agents. Run tasks in sequence with 'Plan & Execute' for complex goals. <a href="#" className="text-primary underline">Learn more.</a>
      </p>

      <CreateCommandDialog>
        <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Add command
        </Button>
      </CreateCommandDialog>

      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border p-4">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div className="flex-grow">
                <p className="font-semibold">my command</p>
                <p className="text-sm text-muted-foreground">here my command</p>
            </div>
        </div>
      </div>
    </div>
  );
}

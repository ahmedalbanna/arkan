
'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { AddStepDialog } from './AddStepDialog';
import { AddTriggerDialog } from './AddTriggerDialog';

export function WorkflowCanvas() {
  return (
    <div className="h-full w-full p-8 bg-dot-pattern flex flex-col items-center">
      <div className="flex flex-col items-center gap-12 w-full max-w-md">
        {/* Trigger Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Badge variant="secondary">When this happens...</Badge>
           <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 border-dashed text-muted-foreground">
                  <Plus className="mr-2 h-4 w-4"/> Add Trigger
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] p-0">
                  <AddTriggerDialog />
              </DialogContent>
          </Dialog>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-4 w-full">
            <Badge variant="secondary">Do this...</Badge>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-14 border-dashed text-muted-foreground">
                        <Plus className="mr-2 h-4 w-4"/> Add Step
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0">
                    <AddStepDialog />
                </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  );
}

const bgDotPattern = `
.bg-dot-pattern {
    background-image: radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0);
    background-size: 20px 20px;
}
`

// Inject styles for the dot pattern
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = bgDotPattern
    document.head.appendChild(styleSheet)
}

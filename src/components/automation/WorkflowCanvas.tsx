'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MoreHorizontal, Plus, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { AddStepDialog } from './AddStepDialog';

const WebhookLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#F59E0B"/>
        <path d="M12 6C9.24 6 7 8.24 7 11C7 12.76 7.85 14.31 9.09 15.34L7.5 17.5L9.5 18.5L11.53 15.82C11.68 15.88 11.84 15.92 12 15.96V18H14V15.96C14.16 15.92 14.32 15.88 14.47 15.82L16.5 18.5L18.5 17.5L16.91 15.34C18.15 14.31 19 12.76 19 11C19 8.24 16.76 6 14 6H12ZM12 8H14C15.66 8 17 9.34 17 11C17 12.66 15.66 14 14 14H12V8Z" fill="#F59E0B"/>
    </svg>
)

const TaskadeAILogo = () => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="url(#paint0_angular_23_3351)"/>
        <defs>
        <radialGradient id="paint0_angular_23_3351" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(20)">
        <stop stopColor="#F97316"/>
        <stop offset="0.16" stopColor="#F9A72B"/>
        <stop offset="0.32" stopColor="#4ADE80"/>
        <stop offset="0.48" stopColor="#3B82F6"/>
        <stop offset="0.66" stopColor="#8B5CF6"/>
        <stop offset="0.8" stopColor="#EC4899"/>
        <stop offset="1" stopColor="#EF4444"/>
        </radialGradient>
        </defs>
    </svg>
)

export function WorkflowCanvas() {
  return (
    <div className="h-full w-full p-8 bg-dot-pattern flex flex-col items-center">
        <div className="flex flex-col items-center gap-4">
            {/* Trigger */}
            <Badge variant="secondary">When this happens..</Badge>
            <Card className="w-80 shadow-md">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <WebhookLogo />
                        <span className="font-medium">Webhook Trigger</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                         <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="h-8 w-px bg-border" />

             {/* Action */}
             <Badge variant="secondary">Do this...</Badge>
            <Button variant="ghost" size="icon" className="rounded-full border bg-background">
                <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
             <Card className="w-80 shadow-md border-2 border-primary">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TaskadeAILogo />
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Taskade AI</span>
                            <span className="font-medium">Run Agent Command</span>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <div className="h-8 w-px bg-border" />

            {/* Add Step */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-80 border-dashed">
                        <Plus className="mr-2 h-4 w-4"/> Add Step
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0">
                    <AddStepDialog />
                </DialogContent>
            </Dialog>
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
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = bgDotPattern
document.head.appendChild(styleSheet)

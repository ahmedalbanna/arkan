
'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { WorkflowCanvas } from './WorkflowCanvas';
import { ActionPanel } from './ActionPanel';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ChevronRight, Play, Build, History, HelpCircle, Bell } from 'lucide-react';
import Link from 'next/link';

function AutomationHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
            <nav className="flex items-center gap-2 text-sm font-medium">
                <Link href="/admin/manage-agents" className="text-muted-foreground">Automations</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="#" className="font-semibold text-primary">Appendices Automation</Link>
            </nav>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2"><Play className="h-4 w-4"/> Preview</Button>
                <Button variant="outline" size="sm" className="gap-2"><Build className="h-4 w-4"/> Build</Button>
                <Button variant="outline" size="sm" className="gap-2"><History className="h-4 w-4"/> History</Button>
            </div>
            <div className="flex-1 flex justify-end items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Off</span>
                    <Switch />
                </div>
                <Button>Save</Button>
                <Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Bell className="h-5 w-5"/></Button>
                 <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}

export default function AutomationBuilder() {
  return (
    <div className="h-full flex flex-col">
        <AutomationHeader />
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={70}>
            <WorkflowCanvas />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={25} maxSize={35}>
            <ActionPanel />
        </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}

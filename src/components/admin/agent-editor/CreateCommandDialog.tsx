
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface CommandModeSelectorProps {
    value: 'default' | 'plan-and-execute';
    onChange: (value: 'default' | 'plan-and-execute') => void;
}

function CommandModeSelector({ value, onChange }: CommandModeSelectorProps) {
    const modes = [
        {
            id: 'default',
            title: 'Default',
            description: 'AI Agent follows specific instructions from your prompt directly.',
        },
        {
            id: 'plan-and-execute',
            title: 'Plan and execute',
            description: 'AI Agent sets goals, breaks tasks into steps, and iteratively reasons through them to handle complex tasks autonomously.',
        }
    ] as const;

    return (
        <div className="space-y-2">
            {modes.map((mode) => (
                 <div
                    key={mode.id}
                    onClick={() => onChange(mode.id)}
                    className={cn(
                        "rounded-lg border p-4 cursor-pointer transition-all",
                        value === mode.id ? "border-primary ring-2 ring-primary" : "border-border"
                    )}
                 >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{mode.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                        </div>
                        {value === mode.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                 </div>
            ))}
        </div>
    );
}


export function CreateCommandDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [commandMode, setCommandMode] = useState<'default' | 'plan-and-execute'>('default');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a new command</DialogTitle>
          <DialogDescription>
            Type /command name to execute commands in your project. <a href="#" className="text-primary underline">Learn more.</a>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid gap-2">
                <Label htmlFor="command-name">NAME</Label>
                <Input id="command-name" defaultValue="my command" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="command-prompt">PROMPT (12/5000)</Label>
                <Textarea id="command-prompt" defaultValue="here command" className="min-h-32" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <CommandModeSelector value={commandMode} onChange={setCommandMode} />
                 <div className="flex items-center justify-center">
                    <Button variant="outline"><BookOpen className="mr-2 h-4 w-4" /> View prompts</Button>
                 </div>
            </div>

            <div className="grid gap-2">
                 <Select defaultValue="default">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="plan-b">Plan B</SelectItem>
                    </SelectContent>
                 </Select>
                  <p className="text-sm text-muted-foreground">
                    <a href="#" className="text-primary underline">Learn more</a> about agent command modes.
                </p>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="button">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

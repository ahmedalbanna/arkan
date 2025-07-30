
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Pencil, Plus, Info } from 'lucide-react';

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


export function ActionPanel() {
  return (
    <Card className="h-full rounded-none border-l-0 shadow-lg flex flex-col">
      <CardHeader className="flex-row items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <TaskadeAILogo />
          <CardTitle className="text-sm font-medium">Taskade AI</CardTitle>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-grow">
        <div className="space-y-1">
          <Label>Action</Label>
          <Select defaultValue="run-agent-command">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="run-agent-command">Run Agent Command</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Agent <span className="text-muted-foreground font-normal">Required</span></Label>
          <Select defaultValue="report-intro-agent">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="report-intro-agent">Report Introduction Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Command <span className="text-muted-foreground font-normal">Required</span></Label>
          <Select defaultValue="generate-chapter-intro">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generate-chapter-intro">Generate Chapter Introduction</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Input <span className="text-muted-foreground font-normal">Optional</span></Label>
          <div className="relative">
            <Textarea placeholder="Use @ for variables..." rows={4} className="pr-8"/>
            <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
       <CardFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4"/>
            <p>Learn more about Run Agent Command.</p>
        </div>
      </CardFooter>
    </Card>
  );
}

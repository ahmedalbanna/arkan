'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye, LayoutGrid, Bot, Wrench, ListFilter, GitBranch, Hourglass, Repeat, Search, Globe, FileCode, Youtube, Send,
  Check, File, Image as ImageIcon, Briefcase, MessageSquare, Calendar, Zap, Rocket, Pen, Mail, User, List, ShoppingCart, Newspaper, BarChart, Settings, SearchCode, Beaker, GraduationCap, Building, Landmark, Phone, BrainCircuit, Filter, Sparkles, FolderKanban, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TaskadeLogo = () => (
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="url(#paint0_angular_1_1)"></circle><defs><radialGradient id="paint0_angular_1_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(20)"><stop stopColor="#F97316"></stop><stop offset="0.16" stopColor="#F9A72B"></stop><stop offset="0.32" stopColor="#4ADE80"></stop><stop offset="0.48" stopColor="#3B82F6"></stop><stop offset="0.66" stopColor="#8B5CF6"></stop><stop offset="0.8" stopColor="#EC4899"></stop><stop offset="1" stopColor="#EF4444"></stop></radialGradient></defs></svg>
)

const coreCategories = [
    { id: 'tasks', name: 'Tasks', icon: Check },
    { id: 'project', name: 'Project', icon: File },
    { id: 'media', name: 'Media', icon: ImageIcon },
];

const aiCategories = [
    { id: 'ai-agents', name: 'AI Agents', icon: Bot },
    { id: 'ask-ai', name: 'Ask AI', icon: Sparkles },
    { id: 'categorize', name: 'Categorize with AI', icon: FolderKanban },
];

const flowControlCategories = [
    { id: 'filter', name: 'Filter Data', icon: Filter },
    { id: 'branch', name: 'Branch', icon: GitBranch },
    { id: 'delay', name: 'Delay', icon: Hourglass },
    { id: 'loop', name: 'Loop', icon: Repeat },
];

const utilitiesCategories = [
    { id: 'search-web', name: 'Search Web', icon: Search },
    { id: 'scrape-webpage', name: 'Scrape Webpage', icon: FileCode },
    { id: 'transcribe-youtube', name: 'Transcribe YouTube Video', icon: Youtube },
    { id: 'send-http', name: 'Send HTTP Request', icon: Send },
];

const taskActions = [
    { title: 'Add Task', description: 'Add a new task to a project' },
    { title: 'Move Task Within Project', description: 'Moves a task to a block within the same project' },
    { title: 'Assign Task', description: 'Assign a task to a user' },
    { title: 'Find Task(s)', description: 'Find task(s) in a project' },
    { title: 'Mark Task As Completed', description: 'Mark a task in a project as completed' },
];

const articleActions = [
    { title: 'Add Task (Automation Action)' },
    { title: 'Move Task (Automation Action)' },
    { title: 'Assign Task (Automation Action)' },
    { title: 'Find Task(s) (Automation Action)' },
    { title: 'Mark Task As Completed (Automation Action)' },
];


export function AddStepDialog() {
  const [activeCategory, setActiveCategory] = useState('tasks');
  const [activeFilter, setActiveFilter] = useState('Show all');

  const filters = [
      { id: 'Show all', icon: Eye },
      { id: 'Apps', icon: LayoutGrid },
      { id: 'AI', icon: Bot },
      { id: 'Utilities', icon: Wrench },
      { id: 'Taskade', icon: TaskadeLogo },
  ]

  const renderCategoryList = (title: string, items: {id: string, name: string, icon: React.ElementType}[]) => (
      <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase">{title}</h3>
          <div className="mt-1 space-y-1">
              {items.map(item => (
                  <Button
                      key={item.id}
                      variant={activeCategory === item.id ? 'secondary' : 'ghost'}
                      onClick={() => setActiveCategory(item.id)}
                      className="w-full justify-start gap-2"
                  >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                  </Button>
              ))}
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-background rounded-lg">
      <header className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search actions..." className="pl-10" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {filters.map(filter => (
                 <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'secondary' : 'outline'}
                    onClick={() => setActiveFilter(filter.id)}
                    className="gap-2"
                >
                    <filter.icon className="h-4 w-4" />
                    {filter.id}
                </Button>
            ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="w-64 border-r">
          <div className="p-2 space-y-4">
            {renderCategoryList('Core', coreCategories)}
            {renderCategoryList('AI', aiCategories)}
            {renderCategoryList('Flow Control', flowControlCategories)}
            {renderCategoryList('Utilities', utilitiesCategories)}
          </div>
        </ScrollArea>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tasks</h3>
              <div className="space-y-2">
                {taskActions.map((action, i) => (
                  <Button key={i} variant="outline" className="w-full h-auto justify-start text-left">
                    <div className="flex items-center gap-3 p-2">
                      <TaskadeLogo />
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm text-muted-foreground font-normal">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
             <div>
              <h3 className="text-lg font-semibold mb-2">Articles</h3>
              <div className="space-y-2">
                {articleActions.map((action, i) => (
                  <Button key={i} variant="outline" className="w-full h-auto justify-start text-left">
                    <div className="flex items-center gap-3 p-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{action.title}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye, LayoutGrid, Bot, Wrench, Search, Rss, Clock, Webhook, Mail, Calendar, MessageSquare, FileText, Check, ListChecks, MessageCircle, FilePen, UserPlus, FileUp, ListPlus, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TaskadeLogo = () => (
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="url(#paint0_angular_1_1)"></circle><defs><radialGradient id="paint0_angular_1_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(20)"><stop stopColor="#F97316"></stop><stop offset="0.16" stopColor="#F9A72B"></stop><stop offset="0.32" stopColor="#4ADE80"></stop><stop offset="0.48" stopColor="#3B82F6"></stop><stop offset="0.66" stopColor="#8B5CF6"></stop><stop offset="0.8" stopColor="#EC4899"></stop><stop offset="1" stopColor="#EF4444"></stop></radialGradient></defs></svg>
)

const GoogleSheetsLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#34A853" d="M12.91 16.5H9.25V13h3.66zm0-5.5H9.25V7.5h3.66z"/><path fill="#4285F4" d="M16.5 13v3.5h-3.59V13zm-5.5-2h-3.66v3.5h3.66z"/><path fill="#FBBC04" d="M13 16.5h3.5V20H13z"/><path fill="#EA4335" d="M7.5 13v3.5H4V13z"/><path fill="none" d="M0 0h24v24H0z"/><path fill="#188038" d="M20 10.18v4.64c0 1.08-.82 1.95-1.9 1.95H5.9c-1.08 0-1.9-.87-1.9-1.95V5.18c0-1.08.82-1.95 1.9-1.95h8.92l4.28 4.28V9.5h-5.2V4H5.9c-.5 0-.9.4-.9.95v13.1c0 .5.4.95.9.95h12.2c.5 0 .9-.45.9-.95V10.18h.55z"/></svg>
const GmailLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22 5.88v10.44c0 1.45-.72 2.18-1.73 2.18H3.73C2.72 18.5 2 17.77 2 16.32V5.88c0-.98.49-1.76 1.34-2.29l7.03-4.04c.8-.46 1.65-.46 2.45 0l6.83 4.04c.85.53 1.35 1.31 1.35 2.29z" fill="#E54134"/><path d="M22 5.88v.2L12.1 12.33a.29.29 0 01-.2 0L2 6.08v-.2c0-.98.49-1.76 1.34-2.29l7.03-4.04c.8-.46 1.65-.46 2.45 0l6.83 4.04c.85.53 1.35 1.31 1.35 2.29z" fill="#D3352A"/><path d="M3.73 18.5h16.54c.48 0 .73-.3.73-.7V7.27l-8.5 4.9c-.8.47-1.66.47-2.46 0l-7.04-4.2c-.18.3-.27.64-.27 1v9.83c0 1.45.73 2.18 1.73 2.18z" fill="#B02922"/></svg>
const TypeformLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M14.5 9H9.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h5c.3 0 .5.2.5.5s-.2.5-.5.5z" fill="#525252"/><path d="M13 12H9.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h3.5c.3 0 .5.2.5.5s-.2.5-.5.5zm1.5 3H9.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h5c.3 0 .5.2.5.5s-.2.5-.5.5z" fill="#525252"/><path d="M20 6.5V20H4V4h8.5l.5.5H20v2z" fill="#262627"/><path d="M12 4.5V1H6v3.5z" fill="#3D3D3D"/></svg>
const SlackLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M5.04 15.12c0 1.01.82 1.83 1.83 1.83h2.07v-3.66H5.04v1.83z" fill="#36C5F0"/><path d="M8.94 15.12c1.01 0 1.83-.82 1.83-1.83v-2.07H7.11v3.9h1.83z" fill="#2EB67D"/><path d="M8.94 5.04c0-1.01.82-1.83 1.83-1.83h2.07v3.66H8.94V5.04z" fill="#ECB22E"/><path d="M8.94 8.94c-1.01 0-1.83.82-1.83 1.83v2.07h3.66V8.94H8.94z" fill="#E01E5A"/><path d="M16.95 8.94c0-1.01-.82-1.83-1.83-1.83H13.05v3.66h3.9V8.94z" fill="#36C5F0"/><path d="M15.12 8.94c-1.01 0-1.83.82-1.83 1.83v2.07h3.66V8.94h-1.83z" fill="#2EB67D"/><path d="M15.12 18.96c0 1.01-.82 1.83-1.83 1.83h-2.07v-3.66h3.9v1.83z" fill="#ECB22E"/><path d="M15.12 15.12c1.01 0 1.83-.82 1.83-1.83v-2.07h-3.66v3.9h1.83z" fill="#E01E5A"/></svg>
const GoogleFormsLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M12.98 2.05L5 2.05a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V9.03z" fill="#7E57C2"/><path d="M14.47 2L5 2v.05h9.47z" fill="#5E35B1"/><path d="M21 7.53V9.03l-6.52.02v.01l-2.95-.02H5V7.5h16z" fill="#9575CD"/><path d="M5 20.05h14V22H5z" fill="#5E35B1"/></svg>
const CalendlyLogo = () => <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M21.09 12a9.09 9.09 0 11-18.18 0 9.09 9.09 0 0118.18 0z" fill="#006BFF"/><path d="M12.3 8.24l4.23 4.24-4.23 4.23-1.3-1.3 2.93-2.93-2.93-2.93 1.3-1.3z" fill="#FFFFFF"/><path d="M8.1 12.48l1.3 1.3-2.93 2.93-1.3-1.3 2.93-2.93zM8.1 11.18l-1.3-1.3 2.93-2.93 1.3 1.3-2.93 2.93z" fill="#FFFFFF" opacity=".5"/></svg>

const sidebarCategories = [
    { id: 'tasks', name: 'Tasks', icon: ListChecks },
    { id: 'project', name: 'Project', icon: FileText },
    { id: 'form', name: 'Form', icon: FilePen },
    { id: 'agent-tool', name: 'Agent Tool', icon: Wand2 },
    { id: 'ai-agents', name: 'AI Agents', icon: Bot },
    { id: 'rss', name: 'RSS', icon: Rss },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'webhook', name: 'Webhook', icon: Webhook },
    { id: 'mailhook', name: 'Mailhook', icon: Mail },
    { id: 'calendly', name: 'Calendly', icon: CalendlyLogo },
    { id: 'slack', name: 'Slack', icon: SlackLogo },
    { id: 'typeform', name: 'Typeform', icon: TypeformLogo },
    { id: 'gmail', name: 'Gmail', icon: GmailLogo },
    { id: 'google-sheets', name: 'Google Sheets', icon: GoogleSheetsLogo },
    { id: 'google-forms', name: 'Google Forms', icon: GoogleFormsLogo },
];

const taskTriggers = [
    { icon: TaskadeLogo, title: 'Task Completed', description: "Trigger when a task is completed", instant: true },
    { icon: TaskadeLogo, title: 'New Comment', description: "Trigger when there's a new comment", instant: true },
    { icon: TaskadeLogo, title: 'Task Due', description: "Trigger when a task is due", instant: true },
    { icon: TaskadeLogo, title: 'Task Assigned', description: "Trigger when a task is assigned", instant: true },
    { icon: TaskadeLogo, title: 'New Due Date', description: "Trigger when a new due date is added", instant: true },
    { icon: TaskadeLogo, title: 'Task Custom Field Updated', description: "Trigger when a task custom field is updated", instant: true },
    { icon: TaskadeLogo, title: 'Task Added', description: "Trigger when a task is added" },
    { icon: TaskadeLogo, title: 'Task Manual Trigger', description: "Allows you to manually trigger this task", instant: true },
];

const articleTriggers = [
    { icon: FileText, title: 'Task Completed (Automation Trigger)' },
    { icon: FileText, title: 'New Comment (Automation Trigger)' },
];

export function AddTriggerDialog() {
  const [activeCategory, setActiveCategory] = useState('tasks');
  const [activeFilter, setActiveFilter] = useState('Show all');

  const filters = [
      { id: 'Show all', icon: Eye },
      { id: 'Apps', icon: LayoutGrid },
      { id: 'Utilities', icon: Wrench },
      { id: 'Taskade', icon: TaskadeLogo },
  ];

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
          <Input placeholder="Search triggers..." className="pl-10" />
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
            {renderCategoryList('TASKADE', sidebarCategories.slice(0, 5))}
            {renderCategoryList('UTILITIES & WEB SERVICES', sidebarCategories.slice(5, 9))}
            {renderCategoryList('APPS', sidebarCategories.slice(9))}
          </div>
        </ScrollArea>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tasks</h3>
              <div className="space-y-2">
                {taskTriggers.map((action, i) => (
                  <Button key={i} variant="outline" className="w-full h-auto justify-start text-left">
                    <div className="flex items-center gap-3 p-2 w-full">
                      <action.icon />
                      <div className="flex-grow">
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm text-muted-foreground font-normal">{action.description}</p>
                      </div>
                      {action.instant && <Badge variant="outline">Instant</Badge>}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
             <div>
              <h3 className="text-lg font-semibold mb-2">Articles</h3>
              <div className="space-y-2">
                {articleTriggers.map((action, i) => (
                  <Button key={i} variant="outline" className="w-full h-auto justify-start text-left">
                    <div className="flex items-center gap-3 p-2">
                      <action.icon className="h-5 w-5 text-muted-foreground" />
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

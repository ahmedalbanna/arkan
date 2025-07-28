
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateAgent } from '@/hooks/use-agents';
import type { Agent, AgentPrompt } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Bot, BookOpen, Wrench, MessageSquare, ListChecks, Link as LinkIcon, BotMessageSquare, PencilRuler } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import KnowledgeTab from './KnowledgeTab';
import ToolsTab from './ToolsTab';
import GuidelinesTab from './GuidelinesTab';
import AutomationTab from './AutomationTab';
import ContextTab from './ContextTab';
import GeneralTab from './GeneralTab';
import OutputTab from './OutputTab';

interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
}

const agentGuidelineSchema = z.object({
  text: z.string().min(1, "Guideline text cannot be empty."),
  isDefault: z.boolean(),
});

const agentPromptSchema = z.object({
  base: z.string().min(10, "Base prompt must be at least 10 characters."),
  guidelines: z.array(agentGuidelineSchema).optional(),
  jsonStructure: z.any().optional(),
});

const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prompt: z.union([
    z.string().min(10, "Prompt must be at least 10 characters"),
    agentPromptSchema
  ]),
  introduction: z.string().max(500).optional(),
  placeholder: z.string().optional(),
  conversationStarters: z.array(z.object({ value: z.string() })).optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
});

export type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;

const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
  <Button
    type="button"
    variant="ghost"
    onClick={onClick}
    className={cn(
      'w-full justify-start',
      isActive && 'bg-accent text-accent-foreground'
    )}
  >
    <Icon className="mr-2 h-4 w-4" />
    {label}
  </Button>
);

export default function AgentEditor({ agentId, initialData }: AgentEditorProps) {
  const router = useRouter();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState('general');
  
  const updateAgentMutation = useUpdateAgent();

  const form = useForm<AgentEditorFormValues>({
      resolver: zodResolver(agentEditorSchema),
      defaultValues: {
          name: initialData.name,
          prompt: initialData.prompt,
          introduction: '',
          placeholder: 'Ask me anything about TypeScript...',
          conversationStarters: [],
          tone: 'Default',
          language: 'English (US)',
          model: 'googleai/gemini-2.0-flash',

      }
  });

  const isComplexPrompt = typeof form.watch('prompt') === 'object';

  useEffect(() => {
    form.reset({
      name: initialData.name,
      prompt: initialData.prompt,
      introduction: '',
      placeholder: 'Ask me anything about TypeScript...',
      conversationStarters: [],
      tone: 'Default',
      language: 'English (US)',
      model: 'googleai/gemini-2.0-flash',
    });
  }, [initialData, form]);

  const handleSubmit = (data: AgentEditorFormValues) => {
    // We only update name and prompt for now
    updateAgentMutation.mutate({ agentId, payload: { name: data.name, prompt: data.prompt } });
  };

  const navItems = [
    { id: 'general', label: 'General', icon: Bot },
    { id: 'guidelines', label: 'Guidelines', icon: ListChecks },
    { id: 'output', label: 'Output', icon: PencilRuler },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'context', label: 'Context', icon: LinkIcon },
    { id: 'automation', label: 'Automation', icon: BotMessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab isComplexPrompt={isComplexPrompt} isPending={updateAgentMutation.isPending} />;
      case 'guidelines':
        return <GuidelinesTab isComplexPrompt={isComplexPrompt} />;
      case 'output':
        return <OutputTab isComplexPrompt={isComplexPrompt} />;
      case 'knowledge':
        return <KnowledgeTab />;
      case 'tools':
        return <ToolsTab />;
      case 'context':
        return <ContextTab />;
       case 'automation':
        return <AutomationTab />;
      default:
        return <div><CardTitle>{navItems.find(n => n.id === activeTab)?.label}</CardTitle><p>Coming soon...</p></div>;
    }
  };

  return (
    <FormProvider {...form}>
      <Card>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3 border-r p-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    {navItems.map(item => (
                      <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-9">
                <div className="p-6 min-h-[500px]">{renderContent()}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t pt-6 mt-0">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button type="button" variant="outline" disabled>Preview</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Preview is coming soon.</p>
                  </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button type="submit" disabled={updateAgentMutation.isPending}>
              {updateAgentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}

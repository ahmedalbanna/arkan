
'use client';

import { useState } from 'react';
import type { Agent } from '@/lib/models/agent';
import type { AgentCategoryDetails as AgentCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Bot, BookOpen, Wrench, MessageSquare, ListChecks, Link as LinkIcon, BotMessageSquare, PencilRuler } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/lib/utils';
import KnowledgeTab from './KnowledgeTab';
import ToolsTab from './ToolsTab';
import GuidelinesTab from './GuidelinesTab';
import AutomationTab from './AutomationTab';
import ContextTab from './ContextTab';
import GeneralTab from './GeneralTab';
import OutputTab from './OutputTab';
import { useAgentEditor } from '@/hooks/admin/use-agent-editor';
import { type AgentEditorFormValues } from '@/lib/agent-editor-schema';


interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
  allAgents: Agent[];
}

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
    <Icon className="me-2 h-4 w-4" />
    {label}
  </Button>
);

export default function AgentEditor({ agentId, initialData, allAgents }: AgentEditorProps) {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState('general');

  const { form, handleSubmit, isComplexPrompt, isPending, router, categories } = useAgentEditor({
    agentId,
    initialData,
  });

  const onFormSubmit = (data: AgentEditorFormValues) => handleSubmit(data);

  const navItems = [
    { id: 'general', label: t('agentEditor.generalTitle'), icon: Bot },
    { id: 'guidelines', label: t('agentEditor.guidelinesTitle'), icon: ListChecks },
    { id: 'output', label: t('agentEditor.outputTitle'), icon: PencilRuler },
    { id: 'knowledge', label: t('agentEditor.knowledgeTitle'), icon: BookOpen },
    { id: 'tools', label: t('agentEditor.toolsTitle'), icon: Wrench },
    { id: 'context', label: t('agentEditor.contextTitle'), icon: LinkIcon },
    { id: 'automation', label: t('agentEditor.automationTitle'), icon: BotMessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab agentId={agentId} isComplexPrompt={isComplexPrompt} isPending={isPending} categories={categories || []} />;
      case 'guidelines':
        return <GuidelinesTab isComplexPrompt={isComplexPrompt} />;
      case 'output':
        return <OutputTab isComplexPrompt={isComplexPrompt} />;
      case 'knowledge':
        return <KnowledgeTab />;
      case 'tools':
        return <ToolsTab />;
      case 'context':
        return <ContextTab allAgents={allAgents} />;
       case 'automation':
        return <AutomationTab />;
      default:
        return <div><CardTitle>{navItems.find(n => n.id === activeTab)?.label}</CardTitle><p>Coming soon...</p></div>;
    }
  };

  return (
    <FormProvider {...form}>
      <Card>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('agentEditor.saveButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}

    

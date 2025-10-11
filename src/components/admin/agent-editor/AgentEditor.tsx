

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgentEditor } from '@/hooks';
import { type AgentEditorFormValues } from '@/lib/agent-editor-schema';
import type { Agent } from '@/lib/models/agent';
import type { AgentCategoryDetails as AgentCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BookOpen, Bot, Link as LinkIcon, ListChecks, Loader2, PencilRuler, Wrench } from 'lucide-react';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import ContextTab from './ContextTab';
import GeneralTab from './GeneralTab';
import GuidelinesTab from './GuidelinesTab';
import KnowledgeTab from './KnowledgeTab';
import OutputTab from './OutputTab';
import ToolsTab from './ToolsTab';


interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
  categories: AgentCategory[];
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

export default function AgentEditor({ agentId, initialData, categories, allAgents }: AgentEditorProps) {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState('general');

  const { form, handleSubmit, isComplexPrompt, isPending, router } = useAgentEditor({
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

  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab isComplexPrompt={isComplexPrompt} isPending={isPending} categories={categories} />;
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

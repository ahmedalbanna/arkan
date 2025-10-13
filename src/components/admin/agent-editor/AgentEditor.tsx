

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgentEditor } from '@/hooks';
import { type AgentEditorFormValues } from '@/lib/agent-editor-schema';
import type { Agent } from '@/lib/models/agent';
import type { AgentCategoryDetails as AgentCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BookOpen, Bot, Link as LinkIcon, ListChecks, Loader2, PencilRuler, Sparkles, Wrench } from 'lucide-react';
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
  <AnimatedContainer animation="fade-in-up" delay={100}>
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        'w-full justify-start transition-all duration-200 hover:shadow-soft hover:scale-105 group',
        isActive && 'bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary shadow-glow border border-primary/20'
      )}
    >
      <div className={cn(
        "p-1 rounded-md transition-all duration-200 group-hover:scale-110",
        isActive ? "bg-gradient-to-br from-primary to-primary-600" : "bg-muted group-hover:bg-primary/10"
      )}>
        <Icon className={cn(
          "h-4 w-4 transition-colors duration-200",
          isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
        )} />
      </div>
      <span className="ml-3 font-medium">{label}</span>
    </Button>
  </AnimatedContainer>
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <FormProvider {...form}>
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="backdrop-blur-md shadow-glow">
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-3 border-r border-border/50 bg-gradient-to-b from-background/50 to-primary/5 p-6">
                    <AnimatedContainer animation="fade-in-left" delay={300}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg font-headline font-semibold">Agent Editor</h2>
                            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                              <Sparkles className="h-3 w-3" />
                              AI-Powered
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {navItems.map((item, index) => (
                            <NavItem
                              key={item.id}
                              {...item}
                              isActive={activeTab === item.id}
                              onClick={() => setActiveTab(item.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </AnimatedContainer>
                  </div>

                  <div className="col-span-9">
                    <div className="p-8 min-h-[600px] bg-gradient-to-br from-background/50 to-primary/5">
                      <AnimatedContainer animation="fade-in-up" delay={400}>
                        {renderContent()}
                      </AnimatedContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-3 border-t border-border/50 bg-gradient-to-r from-background/50 to-primary/5 pt-6 mt-0">
                <AnimatedContainer animation="fade-in-up" delay={500}>
                  <Button type="button" variant="ghost" onClick={() => router.back()} className="hover:shadow-soft">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} variant="gradient" className="hover:shadow-glow">
                    {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    {t('agentEditor.saveButton')}
                  </Button>
                </AnimatedContainer>
              </CardFooter>
            </form>
          </Card>
        </AnimatedContainer>
      </FormProvider>
    </div>
  );
}

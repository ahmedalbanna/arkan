
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PROMPT_CATEGORIES, PROMPT_TEMPLATES } from '@/lib/prompt-templates';

import { HelpCircle, Search, Copy, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks/use-agents';
// ...
const { agents, isLoaded } = useAgents();
const reportAgents = agents.filter(a => a.category === 'report-generation');


export function PromptTemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLocalization();


  const filteredCategories = PROMPT_CATEGORIES;

  const filteredTemplates = PROMPT_TEMPLATES.filter((template) => {
    const categoryMatch = selectedCategory === 'All' || template.category === selectedCategory;
    const agentMatch = selectedAgent === 'all' || template.targetAgentIds?.includes(selectedAgent);
    const searchMatch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.prompt.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && agentMatch && searchMatch;
  });

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({ title: 'Prompt Copied!', description: 'The template has been copied to your clipboard.' });
  }

  const handleUseTemplate = (agentId: string, prompt: string) => {
    // This is a simplified approach. A more robust implementation might use a state management
    // solution to pass the prompt to the editor page to avoid long URL params.
    router.push(`/admin/manage-agents/${agentId}/edit?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">{t('promptLibrary.headerTitle')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('promptLibrary.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-48"
                />
            </div>
             <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('promptLibrary.filterAgentPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">{t('promptLibrary.allAgents')}</SelectItem>
                  {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button variant="ghost"><HelpCircle className="me-2 h-4 w-4" />{t('promptLibrary.learnMore')}</Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Categories */}
        <ScrollArea className="w-64 border-r">
            <div className="p-2">
                 <Button
                    variant={selectedCategory === 'All' ? "secondary" : "ghost"}
                    onClick={() => setSelectedCategory('All')}
                    className="w-full justify-start gap-2"
                >
                    <Bot className="h-4 w-4" />
                    <span className="flex-grow text-left">{t('promptLibrary.categories.all')}</span>
                     <Badge variant="outline" className="text-xs">{PROMPT_TEMPLATES.length}</Badge>
                </Button>
                {filteredCategories.map(category => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? "secondary" : "ghost"}
                        onClick={() => setSelectedCategory(category.name)}
                        className="w-full justify-start gap-2"
                    >
                        <category.icon className="h-4 w-4" />
                        <span className="flex-grow text-left">{t(`promptLibrary.categories.${category.id}`)}</span>
                        <Badge variant="outline" className="text-xs">{category.count}</Badge>
                    </Button>
                ))}
            </div>
        </ScrollArea>
        {/* Right Panel: Prompts */}
        <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
                {filteredTemplates.map((template, index) => (
                    <Card key={index} className="group hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle className="text-base">{template.title}</CardTitle>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Bot className="h-3 w-3" />
                                    <span>{agents.find(a => a.id === template.targetAgentIds?.[0])?.name || template.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleCopyPrompt(template.prompt)}>
                                    <Copy className="me-2 h-4 w-4"/> {t('promptLibrary.copyButton')}
                                </Button>
                                {template.targetAgentIds && (
                                    <Button size="sm" onClick={() => handleUseTemplate(template.targetAgentIds![0], template.prompt)}>{t('promptLibrary.useTemplateButton')}</Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{template.prompt}</p>
                        </CardContent>
                    </Card>
                ))}
                 {filteredTemplates.length === 0 && (
                    <div className="text-center text-muted-foreground py-16">
                        <p>{t('promptLibrary.noResults')}</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>
    </Card>
  );
}

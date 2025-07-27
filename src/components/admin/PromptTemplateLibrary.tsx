
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PROMPT_CATEGORIES, PROMPT_TEMPLATES } from '@/lib/prompt-templates';
import { HelpCircle, Search, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PromptTemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Taskade AI');
  const { toast } = useToast();

  const filteredCategories = PROMPT_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = PROMPT_TEMPLATES.filter(
    (template) =>
      template.category === selectedCategory &&
      (template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({ title: 'Prompt Copied!', description: 'The template has been copied to your clipboard.' });
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">AI Prompt Templates</h2>
        <div className="flex items-center gap-2">
            <Button variant="ghost"><HelpCircle className="mr-2 h-4 w-4" />Learn More</Button>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Categories */}
        <ScrollArea className="w-64 border-r">
            <div className="p-2">
                {filteredCategories.map(category => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? "secondary" : "ghost"}
                        onClick={() => setSelectedCategory(category.name)}
                        className="w-full justify-start gap-2"
                    >
                        <category.icon className="h-4 w-4" />
                        <span className="flex-grow text-left">{category.name}</span>
                        <Badge variant="outline" className="text-xs">{category.count}</Badge>
                    </Button>
                ))}
            </div>
        </ScrollArea>
        {/* Right Panel: Prompts */}
        <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
                {filteredTemplates.map((template, index) => (
                    <Card key={index} className="group hover:bg-muted/50">
                        <CardHeader className="flex flex-row justify-between items-start">
                            <CardTitle className="text-base">{template.title}</CardTitle>
                             <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopyPrompt(template.prompt)}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{template.prompt}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
      </div>
    </Card>
  );
}

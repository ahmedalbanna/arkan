/**
 * Step Library Component
 * 
 * Library of available step types that can be added to flows.
 */

'use client';

import React, { useState } from 'react';
import { StepType } from '@/lib/models/flow-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Database, 
  Wrench, 
  FileText, 
  GitBranch, 
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StepTemplate {
  type: StepType;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  tags: string[];
}

interface StepLibraryProps {
  onStepSelect: (type: StepType) => void;
  compact?: boolean;
}

const stepTemplates: StepTemplate[] = [
  {
    type: 'GENERATE',
    name: 'Generate Text',
    description: 'Generate text content using an LLM with a prompt template',
    icon: Zap,
    category: 'AI',
    tags: ['ai', 'llm', 'generation', 'text'],
  },
  {
    type: 'RETRIEVE',
    name: 'Retrieve Context',
    description: 'Fetch relevant context from the RAG vector database',
    icon: Database,
    category: 'Data',
    tags: ['rag', 'retrieval', 'context', 'search'],
  },
  {
    type: 'TOOL',
    name: 'Execute Tool',
    description: 'Run a registered tool or external API call',
    icon: Wrench,
    category: 'Integration',
    tags: ['tool', 'api', 'function', 'external'],
  },
  {
    type: 'FORMAT',
    name: 'Format Output',
    description: 'Transform and format data into a specific structure',
    icon: FileText,
    category: 'Processing',
    tags: ['format', 'transform', 'output', 'template'],
  },
  {
    type: 'CONDITION',
    name: 'Conditional Branch',
    description: 'Create conditional logic based on data or context',
    icon: GitBranch,
    category: 'Control Flow',
    tags: ['condition', 'if', 'branch', 'logic'],
  },
  {
    type: 'LOOP',
    name: 'Loop Iteration',
    description: 'Iterate over a collection and process each item',
    icon: RefreshCw,
    category: 'Control Flow',
    tags: ['loop', 'iterate', 'foreach', 'map'],
  },
];

export function StepLibrary({ onStepSelect, compact = false }: StepLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter steps based on search and category
  const filteredSteps = stepTemplates.filter((step) => {
    const matchesSearch =
      searchQuery === '' ||
      step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || step.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(stepTemplates.map((s) => s.category)));

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Button
                  key={step.type}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => onStepSelect(step.type)}
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{step.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {step.description}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 ml-2 flex-shrink-0" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Step Library</CardTitle>
        <CardDescription className="text-xs">
          Drag or click to add steps to your flow
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Step Cards */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {filteredSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.type}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onStepSelect(step.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{step.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {step.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredSteps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No steps found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
}

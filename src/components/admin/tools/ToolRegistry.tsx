/**
 * Tool Registry Component
 * 
 * Manage and view registered tools available for use in flows.
 */

'use client';

import React, { useState } from 'react';
import { ToolConfiguration } from '@/lib/models/tool-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Wrench,
  Code,
  ExternalLink,
  Settings,
  Plus,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ToolRegistryProps {
  tools: ToolConfiguration[];
  onToolSelect?: (tool: ToolConfiguration) => void;
  onToolAdd?: () => void;
}

export function ToolRegistry({ tools, onToolSelect, onToolAdd }: ToolRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<ToolConfiguration | null>(null);

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || tool.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Group by type
  const toolsByType = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.type]) {
      acc[tool.type] = [];
    }
    acc[tool.type].push(tool);
    return acc;
  }, {} as Record<string, ToolConfiguration[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'built-in':
        return Wrench;
      case 'custom':
        return Code;
      case 'external':
        return ExternalLink;
      default:
        return Settings;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'built-in':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'custom':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'external':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full flex">
      {/* Tool List */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tools Registry</h3>
            {onToolAdd && (
              <Button size="sm" variant="outline" onClick={onToolAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              All ({tools.length})
            </Button>
            <Button
              variant={typeFilter === 'built-in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('built-in')}
            >
              Built-in
            </Button>
            <Button
              variant={typeFilter === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('custom')}
            >
              Custom
            </Button>
            <Button
              variant={typeFilter === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('external')}
            >
              External
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {Object.entries(toolsByType).map(([type, typeTools]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  {React.createElement(getTypeIcon(type), { className: 'w-4 h-4' })}
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({typeTools.length})
                </h4>
                <div className="space-y-2">
                  {typeTools.map((tool) => (
                    <Card
                      key={tool.name}
                      className={cn(
                        'cursor-pointer hover:border-primary transition-colors',
                        selectedTool?.name === tool.name && 'border-primary bg-muted/50'
                      )}
                      onClick={() => {
                        setSelectedTool(tool);
                        onToolSelect?.(tool);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="font-medium text-sm">{tool.name}</h5>
                          <Badge className={cn('text-xs', getTypeColor(tool.type))}>
                            {tool.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tools found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Tool Details */}
      <div className="flex-1 overflow-auto">
        {selectedTool ? (
          <div className="p-6 max-w-3xl">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTool.name}</CardTitle>
                    <CardDescription>{selectedTool.description}</CardDescription>
                  </div>
                  <Badge className={getTypeColor(selectedTool.type)}>
                    {selectedTool.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuration */}
                <div>
                  <h4 className="font-medium mb-3">Configuration</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tool Name:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {selectedTool.name}
                      </code>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedTool.type}</span>
                    </div>
                    {selectedTool.timeout && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Timeout:</span>
                        <span className="font-medium">{selectedTool.timeout}ms</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Schema */}
                {selectedTool.inputSchema && (
                  <div>
                    <h4 className="font-medium mb-3">Input Schema</h4>
                    <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedTool.inputSchema, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Output Schema */}
                {selectedTool.outputSchema && (
                  <div>
                    <h4 className="font-medium mb-3">Output Schema</h4>
                    <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedTool.outputSchema, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Handler Info */}
                {selectedTool.handler && (
                  <div>
                    <h4 className="font-medium mb-3">Handler</h4>
                    <code className="block p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                      {selectedTool.handler}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a tool to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

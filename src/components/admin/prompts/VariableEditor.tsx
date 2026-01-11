/**
 * Variable Editor Component
 * 
 * Editor for defining and managing prompt variables and their schemas.
 */

'use client';

import React, { useState } from 'react';
import { PromptVariable } from '@/lib/models/prompt-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Code, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface VariableEditorProps {
  variables: PromptVariable[];
  onChange: (variables: PromptVariable[]) => void;
  onInsertVariable?: (variableName: string) => void;
}

export function VariableEditor({ variables, onChange, onInsertVariable }: VariableEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const handleAddVariable = () => {
    const newVariable: PromptVariable = {
      name: `variable${variables.length + 1}`,
      type: 'string',
      description: '',
      required: false,
    };
    onChange([...variables, newVariable]);
    setSelectedIndex(variables.length);
    setExpandedIndices(new Set([...expandedIndices, variables.length]));
  };

  const handleUpdateVariable = (index: number, updates: Partial<PromptVariable>) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    onChange(updatedVariables);
  };

  const handleDeleteVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onChange(updatedVariables);
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedIndices);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIndices(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      case 'number':
        return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'boolean':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950';
      case 'array':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'object':
        return 'text-pink-600 bg-pink-50 dark:bg-pink-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Variables</CardTitle>
            <CardDescription className="text-xs">
              Define variables used in your prompt template
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddVariable}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
        {variables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Code className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No variables defined</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Variables allow you to pass dynamic data into your prompt templates.
            </p>
            <Button size="sm" onClick={handleAddVariable}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Variable
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-2">
              {variables.map((variable, index) => {
                const isExpanded = expandedIndices.has(index);
                const isSelected = selectedIndex === index;

                return (
                  <Card
                    key={index}
                    className={cn(
                      'transition-all cursor-pointer',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <CardContent className="p-3">
                      {/* Variable Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(index);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          <code className="text-sm font-mono font-semibold truncate">
                            {'{{'}{variable.name}{'}}'}
                          </code>
                          <Badge variant="outline" className={cn('text-xs', getTypeColor(variable.type))}>
                            {variable.type}
                          </Badge>
                          {variable.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {onInsertVariable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertVariable(variable.name);
                              }}
                            >
                              <Code className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVariable(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Variable Details (Collapsed) */}
                      {!isExpanded && variable.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 ml-8">
                          {variable.description}
                        </p>
                      )}

                      {/* Variable Editor (Expanded) */}
                      {isExpanded && (
                        <div className="space-y-3 mt-3 ml-8">
                          <Separator />

                          <div className="space-y-2">
                            <Label htmlFor={`var-name-${index}`} className="text-xs">
                              Variable Name
                            </Label>
                            <Input
                              id={`var-name-${index}`}
                              value={variable.name}
                              onChange={(e) => handleUpdateVariable(index, { name: e.target.value })}
                              placeholder="variableName"
                              className="h-8 text-sm font-mono"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`var-type-${index}`} className="text-xs">
                              Type
                            </Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value: any) => handleUpdateVariable(index, { type: value })}
                            >
                              <SelectTrigger id={`var-type-${index}`} className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`var-desc-${index}`} className="text-xs">
                              Description
                            </Label>
                            <Textarea
                              id={`var-desc-${index}`}
                              value={variable.description || ''}
                              onChange={(e) =>
                                handleUpdateVariable(index, { description: e.target.value })
                              }
                              placeholder="Describe this variable..."
                              rows={2}
                              className="text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor={`var-required-${index}`} className="text-xs">
                                Required
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                This variable must be provided
                              </p>
                            </div>
                            <Switch
                              id={`var-required-${index}`}
                              checked={variable.required}
                              onCheckedChange={(checked) =>
                                handleUpdateVariable(index, { required: checked })
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {variable.defaultValue !== undefined && (
                            <div className="space-y-2">
                              <Label htmlFor={`var-default-${index}`} className="text-xs">
                                Default Value
                              </Label>
                              <Input
                                id={`var-default-${index}`}
                                value={String(variable.defaultValue)}
                                onChange={(e) =>
                                  handleUpdateVariable(index, { defaultValue: e.target.value })
                                }
                                placeholder="Default value..."
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </div>
  );
}

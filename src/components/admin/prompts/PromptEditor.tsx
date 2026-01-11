/**
 * Prompt Editor
 * 
 * Rich editor for creating and managing prompt templates with variables.
 */

'use client';

import React, { useState } from 'react';
import { PromptConfiguration, PromptVariable } from '@/lib/models/prompt-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Save, Plus, Trash2, Play, Eye } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt?: PromptConfiguration;
  onSave?: (prompt: Partial<PromptConfiguration>) => void;
  onTest?: (prompt: Partial<PromptConfiguration>) => void;
}

export function PromptEditor({ initialPrompt, onSave, onTest }: PromptEditorProps) {
  const [prompt, setPrompt] = useState<Partial<PromptConfiguration>>(
    initialPrompt || {
      name: '',
      displayName: '',
      description: '',
      category: 'general',
      tags: [],
      templateContent: '',
      variables: [],
      status: 'draft',
    }
  );

  const [selectedVariableIndex, setSelectedVariableIndex] = useState<number | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>({});

  // Add new variable
  const handleAddVariable = () => {
    const newVariable: PromptVariable = {
      name: `variable${(prompt.variables?.length || 0) + 1}`,
      type: 'string',
      description: '',
      required: false,
    };

    setPrompt({
      ...prompt,
      variables: [...(prompt.variables || []), newVariable],
    });

    setSelectedVariableIndex(prompt.variables?.length || 0);
  };

  // Update variable
  const handleUpdateVariable = (index: number, updates: Partial<PromptVariable>) => {
    const updatedVariables = [...(prompt.variables || [])];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    setPrompt({ ...prompt, variables: updatedVariables });
  };

  // Delete variable
  const handleDeleteVariable = (index: number) => {
    const updatedVariables = (prompt.variables || []).filter((_, i) => i !== index);
    setPrompt({ ...prompt, variables: updatedVariables });
    setSelectedVariableIndex(null);
  };

  // Insert variable into template
  const handleInsertVariable = (variableName: string) => {
    const template = prompt.templateContent || '';
    const cursorPos = template.length; // In real implementation, track cursor position
    const newTemplate = template + `{{${variableName}}}`;
    setPrompt({ ...prompt, templateContent: newTemplate });
  };

  // Render preview
  const renderPreview = () => {
    let rendered = prompt.templateContent || '';
    
    // Replace variables with preview values
    for (const variable of prompt.variables || []) {
      const value = previewVariables[variable.name] || `[${variable.name}]`;
      rendered = rendered.replace(
        new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
        String(value)
      );
    }
    
    return rendered;
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  placeholder="Prompt Name"
                  value={prompt.displayName || ''}
                  onChange={(e) => setPrompt({ ...prompt, displayName: e.target.value })}
                  className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onTest && onTest(prompt)}>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button onClick={() => onSave && onSave(prompt)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Internal Name</Label>
                <Input
                  placeholder="prompt-name"
                  value={prompt.name || ''}
                  onChange={(e) => setPrompt({ ...prompt, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  placeholder="general"
                  value={prompt.category || ''}
                  onChange={(e) => setPrompt({ ...prompt, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Badge>{prompt.status || 'draft'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Editor */}
        <div className="grid grid-cols-3 gap-6">
          {/* Template Editor */}
          <div className="col-span-2">
            <Tabs defaultValue="template">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="system">System Prompt</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="template">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Content</CardTitle>
                    <CardDescription>
                      Use {"{{variableName}}"} syntax to insert variables
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your prompt template..."
                      value={prompt.templateContent || ''}
                      onChange={(e) =>
                        setPrompt({ ...prompt, templateContent: e.target.value })
                      }
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {prompt.variables?.map((variable) => (
                        <Button
                          key={variable.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsertVariable(variable.name)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {"{{" + variable.name + "}}"}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Prompt</CardTitle>
                    <CardDescription>
                      Optional system instructions for the model
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter system prompt..."
                      value={prompt.systemPrompt || ''}
                      onChange={(e) => setPrompt({ ...prompt, systemPrompt: e.target.value })}
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Preview with sample values</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-4">
                      {prompt.variables?.map((variable) => (
                        <div key={variable.name}>
                          <Label>{variable.name}</Label>
                          <Input
                            placeholder={`Enter ${variable.name}...`}
                            value={previewVariables[variable.name] || ''}
                            onChange={(e) =>
                              setPreviewVariables({
                                ...previewVariables,
                                [variable.name]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {renderPreview()}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Variables Panel */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Variables</CardTitle>
                  <Button size="sm" onClick={handleAddVariable}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {(!prompt.variables || prompt.variables.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No variables yet
                      </p>
                    )}

                    {prompt.variables?.map((variable, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer ${
                          selectedVariableIndex === index ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedVariableIndex(index)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{variable.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVariable(index);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>

                          {selectedVariableIndex === index && (
                            <div className="space-y-2 mt-3 pt-3 border-t">
                              <div>
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={variable.name}
                                  onChange={(e) =>
                                    handleUpdateVariable(index, { name: e.target.value })
                                  }
                                  size={1}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                  value={variable.type}
                                  onValueChange={(value: any) =>
                                    handleUpdateVariable(index, { type: value })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
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
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  value={variable.description}
                                  onChange={(e) =>
                                    handleUpdateVariable(index, { description: e.target.value })
                                  }
                                  rows={2}
                                  className="text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variable.required}
                                  onCheckedChange={(checked) =>
                                    handleUpdateVariable(index, { required: checked })
                                  }
                                />
                                <Label className="text-xs">Required</Label>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Prompt Editor Component
 * Week 4 - Day 4-5: Prompt Editor Interface
 * 
 * Rich editor for creating and editing prompts with variables.
 */

'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariableEditor } from './VariableEditor';
import { PromptTester } from './PromptTester';
import type { PromptConfiguration, PromptVariable } from '@/lib/models/prompt-config';
import { Save, Play, Eye, Code, Settings } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt?: PromptConfiguration;
  onSave?: (prompt: PromptConfiguration) => void;
  onTest?: (prompt: PromptConfiguration, variables: Record<string, any>) => void;
}

export function PromptEditor({
  initialPrompt,
  onSave,
  onTest,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState<PromptConfiguration>(
    initialPrompt || createEmptyPrompt()
  );
  const [activeTab, setActiveTab] = useState('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [showVariableEditor, setShowVariableEditor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Handle template change
  const handleTemplateChange = (value: string) => {
    setPrompt(prev => ({
      ...prev,
      template: value,
    }));
  };

  // Insert variable at cursor
  const insertVariable = useCallback((varName: string) => {
    const textarea = document.querySelector('textarea[name="template"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = prompt.template;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `{{${varName}}}` + after;

    setPrompt(prev => ({
      ...prev,
      template: newText,
    }));

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + varName.length + 4; // {{varName}}
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, [prompt.template]);

  // Handle adding variable
  const handleAddVariable = (variable: PromptVariable) => {
    setPrompt(prev => ({
      ...prev,
      variables: [...prev.variables, variable],
    }));
    setShowVariableEditor(false);
  };

  // Handle updating variable
  const handleUpdateVariable = (index: number, variable: PromptVariable) => {
    setPrompt(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => i === index ? variable : v),
    }));
  };

  // Handle deleting variable
  const handleDeleteVariable = (index: number) => {
    setPrompt(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(prompt);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle test
  const handleTest = (variables: Record<string, any>) => {
    onTest?.(prompt, variables);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold">{prompt.name || 'Untitled Prompt'}</h1>
            <p className="text-sm text-gray-500">
              Version {prompt.version} • {prompt.variables.length} variables
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('test')}
            >
              <Play className="w-4 h-4 mr-2" />
              Test Prompt
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Prompt'}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-gray-200 bg-white px-6">
              <TabsList>
                <TabsTrigger value="editor">
                  <Eye className="w-4 h-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
            </div>

            {/* Editor Tab */}
            <TabsContent value="editor" className="h-full p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Prompt Name</Label>
                      <Input
                        value={prompt.name}
                        onChange={(e) => setPrompt(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter prompt name"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={prompt.description}
                        onChange={(e) => setPrompt(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this prompt does"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Prompt Template</Label>
                    <div className="text-xs text-gray-500">
                      Use {'{{variableName}}'} for variables
                    </div>
                  </div>

                  <Textarea
                    name="template"
                    value={prompt.template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    placeholder="Enter your prompt template here..."
                    rows={15}
                    className="font-mono"
                  />

                  {/* Variable Chips */}
                  {prompt.variables.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Available Variables:</div>
                      <div className="flex flex-wrap gap-2">
                        {prompt.variables.map((variable, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => insertVariable(variable.name)}
                          >
                            {variable.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Preview */}
                <Card className="p-6 bg-blue-50">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {prompt.template || 'No template content...'}
                    </pre>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" className="h-full p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Variables</h2>
                  <Button onClick={() => setShowVariableEditor(true)}>
                    Add Variable
                  </Button>
                </div>

                <div className="space-y-4">
                  {prompt.variables.map((variable, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {'{{'}{variable.name}{'}}'}
                            </code>
                            <span className="text-xs text-gray-500">
                              {variable.type}
                              {variable.required && ' • Required'}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{variable.label}</p>
                          {variable.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {variable.description}
                            </p>
                          )}
                          {variable.defaultValue && (
                            <p className="text-xs text-gray-500 mt-1">
                              Default: {JSON.stringify(variable.defaultValue)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Edit variable logic
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVariable(index)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {prompt.variables.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No variables defined yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowVariableEditor(true)}
                      >
                        Add Your First Variable
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="h-full p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Model Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Temperature</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={prompt.modelConfig?.temperature || 0.7}
                        onChange={(e) => setPrompt(prev => ({
                          ...prev,
                          modelConfig: {
                            ...prev.modelConfig,
                            temperature: parseFloat(e.target.value),
                          },
                        }))}
                      />
                    </div>

                    <div>
                      <Label>Max Tokens</Label>
                      <Input
                        type="number"
                        value={prompt.modelConfig?.maxTokens || 2048}
                        onChange={(e) => setPrompt(prev => ({
                          ...prev,
                          modelConfig: {
                            ...prev.modelConfig,
                            maxTokens: parseInt(e.target.value),
                          },
                        }))}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Output Format</h3>
                  <div>
                    <Label>Format Type</Label>
                    <Select
                      value={prompt.outputFormat.type}
                      onValueChange={(value: any) => setPrompt(prev => ({
                        ...prev,
                        outputFormat: { ...prev.outputFormat, type: value },
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Test Tab */}
            <TabsContent value="test" className="h-full">
              <PromptTester
                prompt={prompt}
                onTest={handleTest}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Variable Editor Modal */}
      {showVariableEditor && (
        <VariableEditor
          onSave={handleAddVariable}
          onClose={() => setShowVariableEditor(false)}
        />
      )}
    </div>
  );
}

// Helper function
function createEmptyPrompt(): PromptConfiguration {
  return {
    id: '',
    name: 'New Prompt',
    description: '',
    version: '1.0.0',
    tags: [],
    status: 'draft',
    template: '',
    variables: [],
    outputFormat: {
      type: 'text',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      updatedBy: 'user',
    },
  };
}

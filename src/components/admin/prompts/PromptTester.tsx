/**
 * Prompt Tester Component
 * 
 * Interactive testing interface for prompt templates with variable substitution.
 */

'use client';

import React, { useState } from 'react';
import { PromptConfiguration, PromptVariable } from '@/lib/models/prompt-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, Copy, Download, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PromptTesterProps {
  prompt: PromptConfiguration;
  onTest?: (variables: Record<string, any>) => Promise<{
    success: boolean;
    output?: string;
    error?: string;
    metadata?: any;
  }>;
}

interface TestResult {
  timestamp: Date;
  variables: Record<string, any>;
  renderedPrompt: string;
  output?: string;
  error?: string;
  duration?: number;
  metadata?: any;
}

export function PromptTester({ prompt, onTest }: PromptTesterProps) {
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('variables');
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  // Initialize variables with default values
  React.useEffect(() => {
    const initialVars: Record<string, any> = {};
    prompt.variables.forEach(v => {
      if (v.defaultValue !== undefined) {
        initialVars[v.name] = v.defaultValue;
      } else {
        // Set default based on type
        switch (v.type) {
          case 'string':
            initialVars[v.name] = '';
            break;
          case 'number':
            initialVars[v.name] = 0;
            break;
          case 'boolean':
            initialVars[v.name] = false;
            break;
          case 'array':
            initialVars[v.name] = [];
            break;
          case 'object':
            initialVars[v.name] = {};
            break;
        }
      }
    });
    setVariables(initialVars);
  }, [prompt.variables]);

  /**
   * Render prompt with variables
   */
  const renderPrompt = (vars: Record<string, any>): string => {
    let rendered = prompt.templateContent;
    
    // Replace {{variable}} syntax
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  };

  /**
   * Handle variable change
   */
  const handleVariableChange = (name: string, value: any) => {
    setVariables({ ...variables, [name]: value });
  };

  /**
   * Validate variables
   */
  const validateVariables = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    prompt.variables.forEach(v => {
      if (v.required && (variables[v.name] === undefined || variables[v.name] === '')) {
        errors.push(`${v.name} is required`);
      }

      // Type validation
      const value = variables[v.name];
      if (value !== undefined && value !== '') {
        switch (v.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${v.name} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${v.name} must be a boolean`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${v.name} must be an array`);
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`${v.name} must be an object`);
            }
            break;
        }
      }
    });

    return { valid: errors.length === 0, errors };
  };

  /**
   * Run test
   */
  const handleTest = async () => {
    // Validate variables
    const validation = validateVariables();
    if (!validation.valid) {
      setTestResult({
        timestamp: new Date(),
        variables,
        renderedPrompt: renderPrompt(variables),
        error: validation.errors.join(', '),
      });
      setActiveTab('result');
      return;
    }

    setIsRunning(true);
    const startTime = Date.now();

    try {
      const renderedPrompt = renderPrompt(variables);

      if (onTest) {
        // Call actual test API
        const result = await onTest(variables);
        const duration = Date.now() - startTime;

        const testResult: TestResult = {
          timestamp: new Date(),
          variables,
          renderedPrompt,
          output: result.output,
          error: result.error,
          duration,
          metadata: result.metadata,
        };

        setTestResult(testResult);
        setTestHistory([testResult, ...testHistory.slice(0, 9)]); // Keep last 10
        setActiveTab('result');
      } else {
        // Mock test (just show rendered prompt)
        setTestResult({
          timestamp: new Date(),
          variables,
          renderedPrompt,
          output: 'Mock output - Connect to API for actual testing',
          duration: Date.now() - startTime,
        });
        setActiveTab('result');
      }
    } catch (error) {
      setTestResult({
        timestamp: new Date(),
        variables,
        renderedPrompt: renderPrompt(variables),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setActiveTab('result');
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Copy to clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  /**
   * Load test case from history
   */
  const loadHistoryItem = (item: TestResult) => {
    setVariables(item.variables);
    setTestResult(item);
  };

  /**
   * Render variable input
   */
  const renderVariableInput = (variable: PromptVariable) => {
    const value = variables[variable.name];

    switch (variable.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleVariableChange(variable.name, e.target.checked)}
              className="rounded"
            />
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value))}
            placeholder={`Enter ${variable.name}`}
          />
        );

      case 'array':
      case 'object':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleVariableChange(variable.name, parsed);
              } catch {
                // Invalid JSON, keep as string
                handleVariableChange(variable.name, e.target.value);
              }
            }}
            placeholder={`Enter ${variable.type} as JSON`}
            rows={4}
            className="font-mono text-xs"
          />
        );

      default:
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
            rows={3}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Test Prompt</h3>
            <p className="text-sm text-muted-foreground">{prompt.displayName}</p>
          </div>
          <Button onClick={handleTest} disabled={isRunning}>
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Test
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Variables Tab */}
          <TabsContent value="variables" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Input Variables</CardTitle>
                <CardDescription>
                  Provide values for all variables used in the prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prompt.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={variable.name}>
                        {variable.name}
                        {variable.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {variable.type}
                      </Badge>
                    </div>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground">{variable.description}</p>
                    )}
                    {renderVariableInput(variable)}
                  </div>
                ))}

                {prompt.variables.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No variables defined for this prompt
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rendered Prompt</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(renderPrompt(variables))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <CardDescription>
                  Preview with current variable values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {renderPrompt(variables)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Test Result</CardTitle>
                  {testResult && (
                    <div className="flex items-center gap-2">
                      {testResult.error ? (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </Badge>
                      )}
                      {testResult.duration && (
                        <Badge variant="outline">{testResult.duration}ms</Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!testResult ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run a test to see results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResult.error ? (
                      <Alert variant="destructive">
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>{testResult.error}</AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">Output</Label>
                          <div className="mt-2 p-4 bg-muted rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap">
                              {testResult.output || 'No output'}
                            </pre>
                          </div>
                        </div>

                        {testResult.metadata && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Metadata</Label>
                            <div className="mt-2 p-4 bg-muted rounded-lg">
                              <pre className="text-xs font-mono">
                                {JSON.stringify(testResult.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground">Rendered Prompt</Label>
                      <div className="mt-2 p-4 bg-muted rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {testResult.renderedPrompt}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test History</CardTitle>
                <CardDescription>Recent test executions</CardDescription>
              </CardHeader>
              <CardContent>
                {testHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No test history yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {testHistory.map((item, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {item.error ? (
                                  <XCircle className="w-4 h-4 text-destructive" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {item.timestamp.toLocaleString()}
                                </span>
                                {item.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.duration}ms
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {Object.entries(item.variables)
                                  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                                  .join(', ')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PromptTester;

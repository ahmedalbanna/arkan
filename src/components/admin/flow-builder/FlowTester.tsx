/**
 * Flow Tester Component
 * 
 * Interactive testing interface for flows with input configuration and result display.
 */

'use client';

import React, { useState } from 'react';
import { FlowConfiguration } from '@/lib/models/flow-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, CheckCircle, XCircle, Clock, Loader2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FlowTesterProps {
  flow: FlowConfiguration;
  onTest?: (flowId: string, input: Record<string, any>) => Promise<any>;
}

interface TestResult {
  status: 'success' | 'error' | 'running';
  output?: any;
  error?: string;
  duration?: number;
  steps?: Array<{
    stepId: string;
    stepName: string;
    status: 'success' | 'error' | 'skipped';
    output?: any;
    error?: string;
    duration?: number;
  }>;
}

export function FlowTester({ flow, onTest }: FlowTesterProps) {
  const [input, setInput] = useState('{}');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const handleTest = async () => {
    if (!onTest) return;

    try {
      setIsRunning(true);
      setTestResult({ status: 'running' });
      setActiveTab('result');

      const startTime = Date.now();
      const parsedInput = JSON.parse(input);
      
      const result = await onTest(flow.id!, parsedInput);
      const duration = Date.now() - startTime;

      setTestResult({
        status: 'success',
        output: result,
        duration,
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Test Flow</h3>
            <p className="text-sm text-muted-foreground">{flow.displayName}</p>
          </div>
          <Button onClick={handleTest} disabled={isRunning || !onTest}>
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
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Input</CardTitle>
                <CardDescription>
                  Provide input data as JSON for testing the flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Input Data (JSON)</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Flow Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Flow Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps:</span>
                      <span className="font-medium">{flow.steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{flow.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{flow.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{flow.version}</span>
                    </div>
                  </div>
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
                      {testResult.status === 'running' && (
                        <Badge variant="secondary">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      )}
                      {testResult.status === 'success' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </Badge>
                      )}
                      {testResult.status === 'error' && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {testResult.duration && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {testResult.duration}ms
                        </Badge>
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
                ) : testResult.status === 'running' ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Executing flow...</p>
                  </div>
                ) : testResult.status === 'error' ? (
                  <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>{testResult.error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Output</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(testResult.output, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                        {JSON.stringify(testResult.output, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="flex-1 px-4 pb-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step Execution</CardTitle>
                <CardDescription>
                  Detailed execution information for each step
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!testResult?.steps ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No step execution data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResult.steps.map((step, index) => (
                      <Card key={step.stepId}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="font-medium">{step.stepName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.status === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {step.status === 'error' && (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              {step.status === 'skipped' && (
                                <Badge variant="secondary">Skipped</Badge>
                              )}
                              {step.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {step.duration}ms
                                </Badge>
                              )}
                            </div>
                          </div>
                          {step.error && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertDescription className="text-xs">{step.error}</AlertDescription>
                            </Alert>
                          )}
                          {step.output && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View output
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </details>
                          )}
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

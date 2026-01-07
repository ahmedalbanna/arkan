'use client';

/**
 * @fileOverview Project Documentation Dashboard Component
 * 
 * React component for generating project documentation using AI flows.
 * Provides UI for all 7 documentation flows with real-time progress.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Code, 
  BookOpen, 
  BarChart3, 
  Presentation, 
  FileCode, 
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy
} from 'lucide-react';

interface DocumentationResult {
  type: string;
  content: string;
  success: boolean;
  error?: string;
}

export function ProjectDocumentationDashboard() {
  // Form state
  const [projectPath, setProjectPath] = useState('./');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<string>('readme');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<DocumentationResult | null>(null);

  const flows = [
    {
      id: 'readme',
      name: 'README Generator',
      icon: FileText,
      description: 'Professional README.md with badges, installation, and examples',
      color: 'text-blue-500'
    },
    {
      id: 'api-docs',
      name: 'API Documentation',
      icon: Code,
      description: 'Complete API reference with endpoints and examples',
      color: 'text-green-500'
    },
    {
      id: 'tech-spec',
      name: 'Technical Specification',
      icon: FileCode,
      description: 'Detailed technical specs with architecture diagrams',
      color: 'text-purple-500'
    },
    {
      id: 'report',
      name: 'Project Report',
      icon: BarChart3,
      description: 'Status report with metrics and recommendations',
      color: 'text-orange-500'
    },
    {
      id: 'presentation',
      name: 'Presentation Content',
      icon: Presentation,
      description: 'Slide content for demos and pitches',
      color: 'text-pink-500'
    },
    {
      id: 'changelog',
      name: 'Changelog Generator',
      icon: ClipboardList,
      description: 'CHANGELOG.md from git history',
      color: 'text-yellow-500'
    },
    {
      id: 'complete',
      name: 'Complete Documentation',
      icon: BookOpen,
      description: 'Full documentation package (README, API docs, guides)',
      color: 'text-indigo-500'
    }
  ];

  const handleGenerate = async () => {
    if (!projectName || !projectDescription) {
      alert('Please fill in project name and description');
      return;
    }

    setIsGenerating(true);
    setProgress('Initializing...');
    setResult(null);

    try {
      // Call the appropriate API endpoint based on selected flow
      const endpoint = `/api/documentation/${selectedFlow}`;
      
      setProgress('Analyzing project...');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          projectName,
          projectDescription,
          // Add flow-specific parameters
          ...(selectedFlow === 'readme' && {
            template: 'comprehensive',
            includeBadges: true,
            includeInstallation: true,
          }),
          ...(selectedFlow === 'api-docs' && {
            sourcePath: 'src/api',
            format: 'rest',
            includeExamples: true,
          }),
          ...(selectedFlow === 'report' && {
            reportPeriod: 'monthly',
            includeMetrics: true,
            targetAudience: 'stakeholders',
          }),
          ...(selectedFlow === 'presentation' && {
            presentationType: 'demo',
            duration: 15,
            audience: 'stakeholders',
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setProgress('Complete!');
      setResult({
        type: selectedFlow,
        content: data.content || JSON.stringify(data, null, 2),
        success: true,
      });
    } catch (error) {
      setResult({
        type: selectedFlow,
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      alert('Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (result?.content) {
      const blob = new Blob([result.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${result.type}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📚 Project Documentation AI</h1>
        <p className="text-muted-foreground">
          Generate professional documentation, reports, and presentations with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Flow selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Type</CardTitle>
              <CardDescription>Choose what to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {flows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlow(flow.id)}
                  disabled={isGenerating}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedFlow === flow.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start space-x-3">
                    <flow.icon className={`w-5 h-5 mt-0.5 ${flow.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{flow.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flow.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">System Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tools Available:</span>
                <Badge variant="secondary">13</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flows Ready:</span>
                <Badge variant="secondary">7</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prompts:</span>
                <Badge variant="secondary">7</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
              <CardDescription>
                Provide project details for AI generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="My Awesome Project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectPath">Project Path</Label>
                  <Input
                    id="projectPath"
                    placeholder="./"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description *</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe what your project does, its key features, and target users..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={4}
                />
              </div>

              {/* Flow-specific options */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Basic mode uses sensible defaults. Switch to Advanced for more control.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Audience Level</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="expert">Expert/Researcher</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Communication Style</Label>
                      <Select defaultValue="technical">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="narrative">Narrative</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !projectName || !projectDescription}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {progress}
                  </>
                ) : (
                  <>
                    Generate {flows.find(f => f.id === selectedFlow)?.name}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <CardTitle>
                      {result.success ? 'Generation Complete!' : 'Generation Failed'}
                    </CardTitle>
                  </div>
                  {result.success && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto max-h-96 text-sm">
                      <code>{result.content}</code>
                    </pre>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.error || 'An unknown error occurred'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

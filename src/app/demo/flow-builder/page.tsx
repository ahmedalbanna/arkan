'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowBuilderInterface } from '@/components/admin/flow-builder/FlowBuilderInterface';
import { FloatingParticles } from '@/components/demo/FloatingParticles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Sparkles, 
  PlayCircle, 
  BookOpen, 
  Zap,
  FileCode,
  Rocket,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { FlowConfiguration } from '@/lib/models/flow-config';
import { toast } from '@/hooks/util/use-toast';

// Example flow configurations
const EXAMPLE_FLOWS: Record<string, any> = {
  'simple-summarizer': {
    id: 'simple-summarizer',
    name: 'Simple Text Summarizer',
    description: 'Summarizes text using AI',
    version: '1.0.0',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        type: 'ai-generation',
        name: 'Summarize Text',
        config: {
          model: {
            name: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxOutputTokens: 500,
          },
          systemPrompt: 'You are a helpful assistant that summarizes text concisely.',
          userPrompt: 'Summarize the following text:\n\n{{input}}',
        },
      },
    ],
    inputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            description: 'Text to summarize',
          },
        },
        required: ['input'],
      },
    },
    outputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
          },
        },
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'rag-qa-system': {
    id: 'rag-qa-system',
    name: 'RAG Question Answering',
    description: 'Answer questions using RAG retrieval',
    version: '1.0.0',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        type: 'rag-retrieval',
        name: 'Find Relevant Context',
        config: {
          collectionName: 'documents',
          topK: 5,
          minScore: 0.7,
          query: '{{question}}',
        },
      },
      {
        id: 'step-2',
        type: 'ai-generation',
        name: 'Generate Answer',
        config: {
          model: {
            name: 'gemini-2.0-flash-exp',
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
          systemPrompt: 'You are a helpful assistant that answers questions based on provided context.',
          userPrompt: 'Context: {{step-1.context}}\n\nQuestion: {{question}}\n\nAnswer:',
        },
      },
      {
        id: 'step-3',
        type: 'output-formatting',
        name: 'Format Response',
        config: {
          type: 'template',
          format: 'json',
          outputVariable: 'result',
          template: '{"answer": "{{step-2.output}}", "sources": {{step-1.sources}}}',
        },
      },
    ],
    inputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: 'Question to answer',
          },
        },
        required: ['question'],
      },
    },
    outputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          answer: {
            type: 'string',
          },
          sources: {
            type: 'array',
          },
        },
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'content-pipeline': {
    id: 'content-pipeline',
    name: 'Content Generation Pipeline',
    description: 'Multi-step content creation with validation',
    version: '1.0.0',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        type: 'ai-generation',
        name: 'Generate Draft',
        config: {
          model: {
            name: 'gemini-2.0-flash-exp',
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
          systemPrompt: 'You are a professional blog writer.',
          userPrompt: 'Write a blog post about: {{topic}}',
        },
      },
      {
        id: 'step-2',
        type: 'tool-execution',
        name: 'Check Grammar',
        config: {
          toolName: 'grammar-checker',
          input: '{{step-1.output}}',
        },
      },
      {
        id: 'step-3',
        type: 'ai-generation',
        name: 'Improve Content',
        config: {
          model: {
            name: 'gemini-2.0-flash-exp',
            temperature: 0.5,
            maxOutputTokens: 2000,
          },
          systemPrompt: 'You are an editor that improves content based on feedback.',
          userPrompt: 'Original: {{step-1.output}}\n\nFeedback: {{step-2.issues}}\n\nImproved version:',
        },
      },
      {
        id: 'step-4',
        type: 'output-formatting',
        name: 'Format as Markdown',
        config: {
          type: 'template',
          format: 'markdown',
          outputVariable: 'content',
          template: '# {{topic}}\n\n{{step-3.output}}',
        },
      },
    ],
    inputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Blog post topic',
          },
        },
        required: ['topic'],
      },
    },
    outputSchema: {
      type: 'json-schema',
      schema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
          },
        },
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export default function FlowBuilderDemoPage() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<FlowConfiguration | undefined>(undefined);
  const [showGuide, setShowGuide] = useState(false);

  const handleLoadExample = (exampleKey: string) => {
    setCurrentFlow(EXAMPLE_FLOWS[exampleKey]);
    setSelectedExample(exampleKey);
    setShowBuilder(true);
  };

  const handleCreateNew = () => {
    setCurrentFlow(undefined);
    setSelectedExample(null);
    setShowBuilder(true);
  };

  const handleSaveFlow = (flow: FlowConfiguration) => {
    toast({
      title: 'Flow Saved!',
      description: `Flow "${flow.name}" has been saved successfully.`,
    });
    console.log('Saved flow:', flow);
  };

  const handleTestFlow = (flow: FlowConfiguration) => {
    toast({
      title: 'Testing Flow',
      description: `Running test execution for "${flow.name}"...`,
    });
    console.log('Testing flow:', flow);
  };

  if (showBuilder) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen flex flex-col"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border-b bg-background p-4 backdrop-blur-sm"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Flow Builder Demo</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedExample ? `Example: ${EXAMPLE_FLOWS[selectedExample].name}` : 'Create New Flow'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowGuide(true)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Guide
                </Button>
                <Button variant="outline" onClick={() => setShowBuilder(false)}>
                  Back to Examples
                </Button>
              </div>
            </div>
          </motion.div>
          <div className="flex-1 overflow-hidden">
            <FlowBuilderInterface
              initialFlow={currentFlow}
              onSave={handleSaveFlow}
              onTest={handleTestFlow}
            />
          </div>

          {/* Quick Guide Dialog */}
          <Dialog open={showGuide} onOpenChange={setShowGuide}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Flow Builder Quick Guide</DialogTitle>
              <DialogDescription>Learn how to build dynamic flows</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🎯 Building Your First Flow</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Add steps from the library on the left</li>
                  <li>Click on a step to configure it</li>
                  <li>Use variables like <code className="bg-secondary px-1 rounded">{'{{input}}'}</code> to reference data</li>
                  <li>Reference previous steps with <code className="bg-secondary px-1 rounded">{'{{step-1.output}}'}</code></li>
                  <li>Test your flow with the Play button</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">📦 Available Step Types</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 border rounded">
                    <span className="font-medium">Generate:</span> Use AI models
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-medium">Retrieve:</span> RAG context
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-medium">Tool:</span> Execute functions
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-medium">Transform:</span> Process data
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-medium">Format:</span> Output templates
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Drag steps to reorder them</li>
                  <li>Use the Settings tab to configure input/output schemas</li>
                  <li>Test frequently to catch errors early</li>
                  <li>Export your flow as JSON for version control</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 relative">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <FloatingParticles />
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            Interactive Flow Builder
          </motion.h1>
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Build, test, and deploy dynamic AI flows with our visual drag-and-drop interface
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          {[
            { icon: Zap, text: '7 Step Types' },
            { icon: FileCode, text: 'JSON Export' },
            { icon: Rocket, text: 'Production Ready' }
          ].map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Badge variant="default" className="text-sm">
                <badge.icon className="w-4 h-4 mr-1" />
                {badge.text}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <CardContent className="pt-6 relative">
            <div className="text-center space-y-4">
              <motion.h3 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Get Started
              </motion.h3>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Try an example flow or create your own from scratch
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" onClick={handleCreateNew}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create New Flow
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Example Flows */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Example Flows</h2>
          <Badge variant="outline">3 Examples</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Simple Summarizer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card className="hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-primary/50 h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Simple Text Summarizer
                    </CardTitle>
                    <CardDescription>Single-step AI summarization</CardDescription>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Badge variant="secondary">1 Step</Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <motion.div 
                    className="flex items-center gap-2 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Generate step</span>
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Perfect for learning the basics of flow building
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
                    onClick={() => handleLoadExample('simple-summarizer')}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Open in Builder
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RAG QA System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card className="hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-purple-500/50 h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-purple-500 transition-colors">
                      RAG Question Answering
                    </CardTitle>
                    <CardDescription>Retrieval + generation + formatting</CardDescription>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <Badge variant="secondary">3 Steps</Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Retrieve step', 'Generate step', 'Format step'].map((step, idx) => (
                    <motion.div 
                      key={step}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{step}</span>
                    </motion.div>
                  ))}
                  <div className="text-xs text-muted-foreground">
                    Learn RAG integration and multi-step flows
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full group-hover:bg-purple-500 group-hover:text-white transition-colors" 
                    onClick={() => handleLoadExample('rag-qa-system')}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Open in Builder
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card className="hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-blue-500/50 h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-blue-500 transition-colors">
                      Content Pipeline
                    </CardTitle>
                    <CardDescription>Advanced multi-step generation</CardDescription>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Badge variant="secondary">4 Steps</Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Generate draft', 'Tool execution', 'Improve content', 'Format output'].map((step, idx) => (
                    <motion.div 
                      key={step}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + idx * 0.1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{step}</span>
                    </motion.div>
                  ))}
                  <div className="text-xs text-muted-foreground">
                    Complete pipeline with validation and improvement
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full group-hover:bg-blue-500 group-hover:text-white transition-colors" 
                    onClick={() => handleLoadExample('content-pipeline')}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Open in Builder
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="steps">Step Types</TabsTrigger>
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
          </TabsList>

            <TabsContent value="features" className="space-y-4">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle>Visual Builder</CardTitle>
                    <CardDescription>Intuitive drag-and-drop interface</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      'Drag-and-drop step reordering',
                      'Visual step configuration',
                      'Real-time validation',
                      'Step library with search'
                    ].map((feature, idx) => (
                      <motion.div 
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle>Testing & Export</CardTitle>
                    <CardDescription>Test and deploy with confidence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      'Built-in flow tester',
                      'JSON export/import',
                      'Version control ready',
                      'One-click deployment'
                    ].map((feature, idx) => (
                      <motion.div 
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>7 Powerful Step Types</CardTitle>
                  <CardDescription>Build complex workflows with these building blocks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Generate', desc: 'Use AI models to generate text based on prompts', icon: '🤖', color: 'hover:bg-blue-50 dark:hover:bg-blue-950/20' },
                      { name: 'Retrieve', desc: 'Fetch relevant context from RAG vector database', icon: '📚', color: 'hover:bg-green-50 dark:hover:bg-green-950/20' },
                      { name: 'Tool', desc: 'Execute custom tools and functions', icon: '🔧', color: 'hover:bg-orange-50 dark:hover:bg-orange-950/20' },
                      { name: 'Transform', desc: 'Transform data with JavaScript functions', icon: '🔄', color: 'hover:bg-purple-50 dark:hover:bg-purple-950/20' },
                      { name: 'Format', desc: 'Format output using templates', icon: '📄', color: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20' },
                      { name: 'Condition', desc: 'Branch execution based on conditions', icon: '🔀', color: 'hover:bg-pink-50 dark:hover:bg-pink-950/20' },
                      { name: 'Loop', desc: 'Iterate over arrays and collections', icon: '🔁', color: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20' },
                    ].map((step, idx) => (
                      <motion.div 
                        key={step.name} 
                        className={`flex items-start gap-3 p-3 border rounded-lg transition-all cursor-pointer ${step.color}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span 
                          className="text-2xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {step.icon}
                        </motion.span>
                        <div>
                          <div className="font-semibold">{step.name}</div>
                          <div className="text-sm text-muted-foreground">{step.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tips & Best Practices</CardTitle>
                  <CardDescription>Get the most out of the flow builder</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-semibold mb-2">🎯 Variable References</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use double curly braces to reference variables:
                    </p>
                    <motion.div 
                      className="bg-secondary p-2 rounded font-mono text-sm space-y-1"
                      whileHover={{ scale: 1.01 }}
                    >
                      {[
                        "{{input}} - Reference input data",
                        "{{step-1.output}} - Reference previous step output",
                        "{{step-2.context}} - Reference nested properties"
                      ].map((text, idx) => (
                        <motion.div
                          key={text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          {text}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold mb-2">🚀 Performance Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {[
                        'Keep flows simple and focused on one task',
                        'Use caching for frequently repeated operations',
                        'Set appropriate temperature values (0.3 for factual, 0.8 for creative)',
                        'Limit maxTokens to avoid unnecessary costs'
                      ].map((tip, idx) => (
                        <motion.li
                          key={tip}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold mb-2">🛡️ Best Practices</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {[
                        'Always define input and output schemas',
                        'Test flows with various inputs before deploying',
                        'Use descriptive names for steps',
                        'Document complex logic in step descriptions',
                        'Version your flow configurations in Git'
                      ].map((practice, idx) => (
                        <motion.li
                          key={practice}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                        >
                          {practice}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

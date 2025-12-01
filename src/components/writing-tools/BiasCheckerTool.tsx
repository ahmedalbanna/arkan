
'use client';

import type { BiasCheckOutput, BiasIssue } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useBiasCheckerLogic } from '@/hooks/writing-tools/use-bias-checker-logic';
import { AlertCircle, ArrowRight, Loader2, Scale, Sparkles, UploadCloud } from 'lucide-react';

function getScoreColor(score: number) {
  if (score < 50) return 'text-destructive';
  if (score < 80) return 'text-yellow-500';
  return 'text-green-500';
}

function getBiasTypeColor(type: BiasIssue['biasType']) {
  switch (type) {
    case 'Gender':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'Racial':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
    case 'Age-related':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    case 'Ableism':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
    case 'Cultural':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export function BiasCheckerTool() {
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  } = useBiasCheckerLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bias & Inclusivity Checker</CardTitle>
        <CardDescription>Analyze your text for potential biases and get suggestions for more inclusive language.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-4">
              <Textarea
                {...form.register('text')}
                rows={12}
                placeholder="Paste your text here..."
                className="resize-none"
                disabled={mutation.isPending || isUploading}
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                {isUploading ? (
                  <p className="mt-2 text-sm text-muted-foreground">Processing file...</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Drag 'n' drop a file here, or click to select</p>
                )}
                <p className="text-xs text-muted-foreground">Supported: PDF, TXT, MD</p>
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            Check for Bias (1 Credit)
          </Button>
        </form>

        {mutation.isPending && (
          <div className="pt-6 border-t">
            <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Analyzing text for potential biases...
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Inclusivity Report</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center justify-center text-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(results.inclusivityScore)}`}>
                  {results.inclusivityScore}%
                </div>
                <div>
                  <p className="font-semibold">Inclusivity Score</p>
                  <p className="text-xs text-muted-foreground">{results.overallAssessment}</p>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <h4 className="font-semibold">Identified Issues</h4>
              {results.issues.length > 0 ? (
                <div className="space-y-4">
                  {results.issues.map((issue: BiasIssue, index: number) => (
                    <div key={index} className="border p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <p className="font-medium italic">"{issue.phrase}"</p>
                        <Badge variant="outline" className={getBiasTypeColor(issue.biasType)}>
                          {issue.biasType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-semibold">{issue.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                  <p>No significant bias issues were found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

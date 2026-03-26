
'use client';

import type { SentenceStructureCheckOutput, SentenceStructureIssue } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSentenceStructureCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-sentence-structure-checker-logic';
import { AlertTriangle, BarChart2, CheckCircle, Loader2, Sparkles, UploadCloud } from 'lucide-react';

function getVarietyColor(variety: 'low' | 'medium' | 'high') {
  if (variety === 'low') return 'text-destructive';
  if (variety === 'medium') return 'text-yellow-500';
  return 'text-green-500';
}

export function SentenceStructureCheckerTool() {
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  } = useSentenceStructureCheckerLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentence Structure Analysis</CardTitle>
        <CardDescription>Analyze your text for sentence structure, variety, and clarity.</CardDescription>
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
                placeholder="Paste your text here to analyze its sentence structure..."
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
            Analyze Structure (1 Credit)
          </Button>
        </form>

        {mutation.isPending && (
          <div className="pt-6 border-t">
            <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Analyzing sentence structures...
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="font-semibold text-lg">Structure Report</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <Card>
                <CardHeader><CardTitle className="text-2xl">{results.statistics.sentenceCount}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Total Sentences</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-2xl">{results.statistics.averageSentenceLength.toFixed(1)}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Avg. Length (words)</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-2xl">{results.statistics.shortestSentence}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Shortest</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-2xl">{results.statistics.longestSentence}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Longest</p></CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardHeader><CardTitle className="text-base">Overall Assessment</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{results.overallAssessment}</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart2 className={`h-5 w-5 ${getVarietyColor(results.varietyAssessment.lengthVariety)}`} />
                    <span>Length Variety: <span className="font-semibold capitalize">{results.varietyAssessment.lengthVariety}</span></span>
                  </div>
                   <div className="flex items-center gap-2">
                    <BarChart2 className={`h-5 w-5 ${getVarietyColor(results.varietyAssessment.structureVariety)}`} />
                    <span>Structure Variety: <span className="font-semibold capitalize">{results.varietyAssessment.structureVariety}</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h4 className="font-semibold">Issues & Suggestions</h4>
              {results.issues.length > 0 ? (
                <div className="space-y-4">
                  {results.issues.map((issue: SentenceStructureIssue, index: number) => (
                    <div key={index} className="border p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <p className="font-medium italic text-muted-foreground">"{issue.sentence}"</p>
                        <Badge variant="destructive" className="flex-shrink-0 ml-4 capitalize">
                          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                          {issue.issue}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 font-semibold">{issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2" />
                  <p>No significant structure issues found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

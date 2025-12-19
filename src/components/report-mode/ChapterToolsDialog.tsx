
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useChapterActions } from '@/hooks/report-mode/use-chapter-actions';
import { Chapter } from '@/lib/models';
import { Loader2, Sparkles, Wand2, PlusCircle, BrainCircuit, Edit, FileCog } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { DiffView } from '../shared/DiffView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FormProvider, FormField } from '../ui/form';
import { useBuilderStore } from '@/hooks';

interface ChapterToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: Chapter | null;
}

export function ChapterToolsDialog({ isOpen, onOpenChange, chapter }: ChapterToolsDialogProps) {
  const {
    form,
    activeTab,
    setActiveTab,
    activeView,
    setActiveView,
    manipulationType,
    setManipulationType,
    manipulationTypes,
    processingAction,
    setProcessingAction,
    processingActions,
    styles,
    compressionRatio,
    setCompressionRatio,
    onSubmit,
    isProcessing,
    processedText,
    diff,
    handleApplyToNewSection,
  } = useChapterActions(chapter, onOpenChange);
  const { project } = useBuilderStore();

  if (!chapter) return null;

  const renderManipulationControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Manipulation Type</Label>
        <Select value={manipulationType} onValueChange={(v) => setManipulationType(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {manipulationTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {manipulationType === 'rewrite' && (
        <div className="space-y-2">
          <Label>Rewrite Style</Label>
          <Select name="rewriteStyle" onValueChange={(v) => form.setValue('rewriteStyle', v)} defaultValue={form.getValues('rewriteStyle')}>
            <SelectTrigger><SelectValue placeholder="Select a style" /></SelectTrigger>
            <SelectContent>
              {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {manipulationType === 'summarize' && (
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Compression Ratio</Label>
            <Badge variant="outline">{compressionRatio}%</Badge>
          </div>
          <Slider value={[compressionRatio]} onValueChange={(v) => setCompressionRatio(v[0])} min={10} max={90} step={5} />
        </div>
      )}
    </div>
  );
  
  const renderProcessingControls = () => (
     <div className="space-y-4">
        <div className="space-y-2">
            <Label>Source File</Label>
            <FormField
                control={form.control}
                name="sourceFileId"
                render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a file from context..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(project?.externalContext || []).map(file => (
                                <SelectItem key={file.id} value={file.id}>{file.fileName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
         <div className="space-y-2">
            <Label>Action</Label>
            <Select value={processingAction} onValueChange={(v) => setProcessingAction(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {processingActions.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
     </div>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chapter Tools: {chapter.title}</DialogTitle>
          <DialogDescription>
            Apply AI actions to the entire content of this chapter. The result can be saved as a new section.
          </DialogDescription>
        </DialogHeader>
        
        <FormProvider {...form}>
        <form id="chapter-tools-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Controls Panel */}
          <div className="md:col-span-4 space-y-4">
             <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manipulation"><Edit className="mr-2 h-4 w-4"/> Manipulation</TabsTrigger>
                    <TabsTrigger value="processing"><FileCog className="mr-2 h-4 w-4"/> Document Processing</TabsTrigger>
                </TabsList>
                <TabsContent value="manipulation">
                    {renderManipulationControls()}
                </TabsContent>
                <TabsContent value="processing">
                    {renderProcessingControls()}
                </TabsContent>
            </Tabs>
          </div>

          {/* Content Panel */}
          <div className="md:col-span-8 flex flex-col min-h-0">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1 flex flex-col min-h-0">
              <div className="flex-shrink-0 flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="result">Result</TabsTrigger>
                  <TabsTrigger value="diff" disabled={!diff}>Changes</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="result" className="flex-1 mt-2 min-h-0">
                <ScrollArea className="h-full border rounded-md p-4 bg-muted/50">
                  <div className="prose dark:prose-invert max-w-none">
                    {isProcessing ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ReactMarkdown components={markdownComponents}>{processedText || ''}</ReactMarkdown>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="diff" className="flex-1 mt-2 min-h-0">
                <ScrollArea className="h-full border rounded-md p-4 bg-muted/50">
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    {diff && <DiffView diff={diff} />}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-12 flex justify-end gap-2 flex-shrink-0">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              {processedText && (
                <Button type="button" variant="secondary" onClick={handleApplyToNewSection} disabled={isProcessing}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Apply to New Section
                </Button>
              )}
              <Button form="chapter-tools-form" type="submit" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                Apply Action
              </Button>
            </div>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

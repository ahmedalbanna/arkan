
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
import { Chapter, SectionContext } from '@/lib/models';
import { Loader2, Wand2, PlusCircle, Link as LinkIcon, Edit } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { DiffView } from '../shared/DiffView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Form } from '../ui/form';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useBuilderStore } from '@/hooks';
import { Checkbox } from '../ui/checkbox';

interface ChapterToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: Chapter | null;
}

function ContextSelector({
  selectedContext,
  onContextChange,
}: {
  selectedContext: SectionContext;
  onContextChange: (newContext: SectionContext) => void;
}) {
  const { project } = useBuilderStore();
  const allSections = project?.sections || [];
  const externalContext = project?.externalContext || [];

  const toggleSelection = (type: 'sections' | 'externalContext', key: string) => {
    const newContext = { ...selectedContext };
    if (!newContext[type]) {
      (newContext as any)[type] = {};
    }
    (newContext[type] as any)[key] = !(newContext[type] as any)[key];
    onContextChange(newContext);
  };

  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {allSections.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Project Sections</h4>
            {allSections.map(section => (
              <div key={section.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`ctx-sec-${section.id}`}
                  checked={!!selectedContext.sections?.[section.id]}
                  onCheckedChange={() => toggleSelection('sections', section.id)}
                />
                <Label htmlFor={`ctx-sec-${section.id}`} className="font-normal">
                  {section.title}
                </Label>
              </div>
            ))}
          </div>
        )}
        {externalContext.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">External Files</h4>
            {externalContext.map(file => (
              <div key={file.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`ctx-file-${file.id}`}
                  checked={!!selectedContext.externalContext?.[file.id]}
                  onCheckedChange={() => toggleSelection('externalContext', file.id)}
                />
                <Label htmlFor={`ctx-file-${file.id}`} className="font-normal truncate">
                  {file.fileName}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function ChapterToolsDialog({ isOpen, onOpenChange, chapter }: ChapterToolsDialogProps) {
  const {
    form,
    activeView,
    setActiveView,
    manipulationType,
    setManipulationType,
    manipulationTypes,
    styles,
    compressionRatio,
    setCompressionRatio,
    onSubmit,
    isProcessing,
    processedText,
    diff,
    handleApplyToNewSection,
    context,
    setContext,
  } = useChapterActions(chapter, onOpenChange);

  if (!chapter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chapter Tools: {chapter.title}</DialogTitle>
          <DialogDescription>
            Apply AI actions to the entire content of this chapter. The result can be saved as a new section.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form id="chapter-tools-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Controls Panel */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <Tabs defaultValue="actions" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="actions"><Edit className="h-4 w-4 mr-2" /> Actions</TabsTrigger>
                  <TabsTrigger value="context"><LinkIcon className="h-4 w-4 mr-2" /> Context</TabsTrigger>
                </TabsList>
                <TabsContent value="actions" className="flex-1 space-y-4 mt-4">
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
                          <Select onValueChange={(val) => form.setValue('rewriteStyle', val)} defaultValue={form.getValues('rewriteStyle')}>
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

                  {manipulationType === 'style-editor' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label>Target Audience</Label>
                              <Input {...form.register('targetAudience')} placeholder="e.g., general public" />
                          </div>
                          <div className="space-y-2">
                              <Label>Desired Tone</Label>
                              <Input {...form.register('tone')} placeholder="e.g., professional, casual" />
                          </div>
                      </div>
                  )}

                  {manipulationType === 'readability-enhancer' && (
                       <div className="space-y-2">
                          <Label>Target Reading Level</Label>
                          <Select onValueChange={(val) => form.setValue('targetLevel', val)} defaultValue={form.getValues('targetLevel')}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="elementary">Elementary</SelectItem>
                                  <SelectItem value="middle-school">Middle School</SelectItem>
                                  <SelectItem value="high-school">High School</SelectItem>
                                  <SelectItem value="college">College</SelectItem>
                                  <SelectItem value="graduate">Graduate</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  )}
                  
                  {manipulationType === 'conciseness-checker' && (
                      <div className="space-y-3">
                          <div className="flex justify-between">
                              <Label>Target Reduction</Label>
                              <Badge variant="outline">{form.watch('targetReduction') || 0}%</Badge>
                          </div>
                          <Slider 
                              value={[form.watch('targetReduction') || 0]} 
                              onValueChange={(val) => form.setValue('targetReduction', val[0])} 
                              min={0} max={50} step={5} 
                          />
                      </div>
                  )}

                  {manipulationType === 'clarity-advisor' && (
                      <div className="space-y-2">
                          <Label>Focus Areas (comma-separated)</Label>
                          <Input 
                              {...form.register('focusAreas')} 
                              placeholder="e.g., sentence structure, word choice" 
                          />
                      </div>
                  )}
                </TabsContent>
                <TabsContent value="context" className="flex-1 mt-4">
                  <ContextSelector selectedContext={context} onContextChange={setContext} />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}

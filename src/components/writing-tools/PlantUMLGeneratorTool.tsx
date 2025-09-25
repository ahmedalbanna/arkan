
'use client';

import { Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, Image as ImageIcon, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiagramTypeSchema } from '@/ai/schemas';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { usePlantUmlGeneratorLogic } from '@/hooks';

const diagramTypes = DiagramTypeSchema.options.map(value => {
    let label = '';
    if (value === 'er') {
        label = 'ER Diagram';
    } else {
        label = value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }
    return { value, label };
});

export function PlantUMLGeneratorTool() {
    const {
        form,
        mutation,
        onSubmit,
        generatedCode,
        isCopied,
        handleCopy,
        imageUrl
    } = usePlantUmlGeneratorLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>PlantUML Diagram Generator</CardTitle>
        <CardDescription>Describe the diagram you want, and the AI will generate the PlantUML code for it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagramType">Diagram Type</Label>
            <Controller
              name="diagramType"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                  <SelectTrigger id="diagramType">
                    <SelectValue placeholder="Select a diagram type" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagramTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              rows={8}
              placeholder="e.g., A user logs into the system. The system authenticates the user. If successful, the user can view their dashboard."
              disabled={mutation.isPending}
            />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            Generate Diagram (1 Credit)
          </Button>
        </form>

        {(mutation.isPending || generatedCode) && (
          <div className="space-y-4 pt-6 border-t">
            <Tabs defaultValue="preview" className="w-full">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="preview"><ImageIcon className="me-2 h-4 w-4" /> Preview</TabsTrigger>
                        <TabsTrigger value="code"><Code className="me-2 h-4 w-4" /> Code</TabsTrigger>
                    </TabsList>
                    {generatedCode && (
                         <Button variant="ghost" size="icon" onClick={handleCopy}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
                <TabsContent value="preview" className="mt-4">
                    <Card className="min-h-[400px] flex items-center justify-center p-4 bg-muted/30">
                        {mutation.isPending ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : imageUrl ? (
                            <Image src={imageUrl} alt="Generated PlantUML Diagram" width={800} height={600} className="object-contain" unoptimized />
                        ) : (
                            <p>Could not render diagram.</p>
                        )}
                    </Card>
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                    <ScrollArea className="h-[400px] rounded-md border">
                         <Textarea
                            readOnly
                            value={generatedCode}
                            className="h-full p-4 bg-muted/30 text-left font-mono text-xs resize-none border-0 focus-visible:ring-0"
                            dir="ltr"
                        />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

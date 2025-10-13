
'use client';

import { DiagramTypeSchema } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePlantUmlGeneratorLogic } from '@/hooks';
import { Check, Code, Copy, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Controller } from 'react-hook-form';

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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">PlantUML Diagram Generator</CardTitle>
          <CardDescription>Describe the diagram you want, and the AI will generate the PlantUML code for it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="diagramType" className="font-headline">Diagram Type</Label>
                <Controller
                  name="diagramType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                      <SelectTrigger id="diagramType" className="hover:shadow-soft transition-all duration-200">
                        <SelectValue placeholder="Select a diagram type" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                        {diagramTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-headline">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={8}
                  placeholder="e.g., A user logs into the system. The system authenticates the user. If successful, the user can view their dashboard."
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                Generate Diagram (1 Credit)
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || generatedCode) && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-4 pt-6 border-t">
                <Tabs defaultValue="preview" className="w-full">
                  <div className="flex justify-between items-center">
                    <TabsList className="bg-gradient-to-r from-background/50 to-primary/5">
                      <TabsTrigger value="preview" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"><ImageIcon className="me-2 h-4 w-4" /> Preview</TabsTrigger>
                      <TabsTrigger value="code" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"><Code className="me-2 h-4 w-4" /> Code</TabsTrigger>
                    </TabsList>
                    {generatedCode && (
                      <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <TabsContent value="preview" className="mt-4">
                    <Card className="min-h-[400px] flex items-center justify-center p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
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
                    <ScrollArea className="h-[400px] rounded-md border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
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
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}

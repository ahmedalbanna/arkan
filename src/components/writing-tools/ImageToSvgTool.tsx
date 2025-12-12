'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useImageToSvgLogic } from '@/hooks/writing-tools/use-image-to-svg-logic';
import { Check, Copy, Download, Image as ImageIcon, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import Image from 'next/image';

export function ImageToSvgTool() {
  const {
    form,
    onSubmit,
    mutation,
    getRootProps,
    getInputProps,
    isDragActive,
    previewImage,
    svgResult,
    isCopied,
    handleCopy,
    handleDownload,
  } = useImageToSvgLogic();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Converter Options</CardTitle>
          <CardDescription>Upload an image and configure the SVG conversion settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-input'}`}>
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag & drop an image here, or click to select a file.</p>
              {previewImage && <Image src={previewImage} alt="Preview" width={100} height={100} className="mt-4 mx-auto rounded-md object-contain h-24" />}
            </div>
            {form.formState.errors.file && <p className="text-sm text-destructive">{form.formState.errors.file.message as string}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select name="mode" defaultValue="flat" onValueChange={(v) => form.setValue('mode', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="flat">flat</SelectItem><SelectItem value="line">line</SelectItem><SelectItem value="lowpoly">lowpoly</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Preset</Label>
                <Select name="quality" onValueChange={(v) => form.setValue('quality', v as any)}>
                  <SelectTrigger><SelectValue placeholder="(default)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="flat">
                <AccordionTrigger>Flat Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Label>Colors: <Input type="number" {...form.register('colors', { valueAsNumber: true })} defaultValue="8" min="2" max="32" /></Label>
                    <Label>Min Area: <Input type="number" {...form.register('min_area', { valueAsNumber: true })} defaultValue="20" min="1" /></Label>
                    <Label>Epsilon: <Input type="number" step="0.0005" {...form.register('epsilon', { valueAsNumber: true })} defaultValue="0.003" /></Label>
                    <Label>Close Kernel: <Input type="number" {...form.register('close_kernel', { valueAsNumber: true })} defaultValue="3" min="0" /></Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="line">
                <AccordionTrigger>Line Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-2"><Checkbox {...form.register('adaptive')} defaultChecked={false} /> <Label>Adaptive</Label></div>
                    <div className="flex items-center gap-2"><Checkbox {...form.register('invert')} defaultChecked={true} /> <Label>Invert</Label></div>
                    <div className="flex items-center gap-2"><Checkbox {...form.register('centerline')} defaultChecked={true} /> <Label>Centerline</Label></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="bezier">
                <AccordionTrigger>Bezier Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center gap-2"><Checkbox {...form.register('bezier')} /> <Label>Bezier</Label></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="lowpoly">
                <AccordionTrigger>Lowpoly Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <Label>Points: <Input type="number" {...form.register('points', { valueAsNumber: true })} defaultValue="1000" min="100" step="50" /></Label>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
              Convert to SVG
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/> SVG Result</span>
            {svgResult && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy SVG code"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download SVG file"><Download className="h-4 w-4" /></Button>
              </div>
            )}
          </CardTitle>
          <CardDescription>The generated SVG will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <h4 className="font-semibold text-sm">Preview</h4>
            <div className="border rounded-md min-h-[200px] p-4 flex items-center justify-center bg-muted/30">
                {mutation.isPending ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : svgResult ? (
                    <div dangerouslySetInnerHTML={{ __html: svgResult }} className="w-full h-full" />
                ) : <p className="text-muted-foreground text-center">Preview will be shown here.</p>}
            </div>
            <h4 className="font-semibold text-sm">SVG Code</h4>
            <Textarea readOnly value={svgResult} rows={10} className="font-mono text-xs" placeholder="SVG code will appear here..." />
        </CardContent>
      </Card>
    </div>
  );
}

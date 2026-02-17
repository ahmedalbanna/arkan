
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useAIImageGeneratorLogic } from '@/hooks/writing-tools/use-ai-image-generator-logic';
import { Download, Heart, Image as ImageIcon, Loader2, Sparkles, Trash2 } from 'lucide-react';
import Image from 'next/image';

export function AIImageGeneratorTool() {
  const {
    form,
    onSubmit,
    isLoading,
    imageUrl,
    history,
    handleDownload,
    handleSave,
    handleDelete,
    handleLoadFromHistory,
  } = useAIImageGeneratorLogic();

  const { register, handleSubmit, watch, setValue } = form;
  const seedValue = watch('seed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Generator Controls</CardTitle>
          <CardDescription>Adjust the parameters to create your image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                {...register('prompt')}
                placeholder="e.g., A majestic dragon soaring over a mystical forest"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" type="number" {...register('width', { valueAsNumber: true })} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" type="number" {...register('height', { valueAsNumber: true })} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed Control</Label>
              {seedValue !== undefined ? (
                <>
                  <Slider
                    id="seed"
                    min={0}
                    max={9999999999}
                    step={1}
                    value={[seedValue]}
                    onValueChange={(val) => setValue('seed', val[0])}
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    value={seedValue}
                    onChange={(e) => setValue('seed', parseInt(e.target.value, 10))}
                    className="mt-2"
                    disabled={isLoading}
                  />
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Loading seed...</div>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Image
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Generated Image
              {imageUrl && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave}><Heart className="mr-2 h-4 w-4" /> Save</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDownload(imageUrl, `${watch('prompt').slice(0, 20)}_${watch('seed')}`)}><Download className="mr-2 h-4 w-4" /> Download</Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px] bg-muted/50 rounded-lg">
            {isLoading ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : imageUrl ? (
              <Image src={imageUrl} alt={watch('prompt')} width={watch('width')} height={watch('height')} className="rounded-md object-contain max-w-full max-h-[500px]" />
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12" />
                <p>Your generated image will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Saved Images</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map((item) => (
                  <Card key={item.id} className="group relative overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.prompt}
                      width={item.width || 800}
                      height={item.height || 600}
                      className="cursor-pointer object-cover aspect-square"
                      onClick={() => handleLoadFromHistory(item)}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      <p className="text-xs text-white truncate">{item.prompt}</p>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => handleDownload(item.url, `${item.prompt.slice(0, 20)}_${item.seed}`)}><Download className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {history.length === 0 && <p className="text-center text-muted-foreground py-10">No saved images yet.</p>}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

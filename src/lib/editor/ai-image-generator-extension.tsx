
'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const AIImageGeneratorComponent = (props: any) => {
  const [prompt, setPrompt] = useState(props.node.attrs.prompt || 'A beautiful landscape');
  const [width, setWidth] = useState(props.node.attrs.width || 512);
  const [height, setHeight] = useState(props.node.attrs.height || 512);
  const [seed, setSeed] = useState(props.node.attrs.seed || Math.floor(Math.random() * 10000000000));
  const [imageUrl, setImageUrl] = useState(props.node.attrs.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = () => {
    if (!prompt) return;
    setIsLoading(true);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=poll&nofeed=yes&seed=${seed}`;
    const finalUrl = `${url}&v=${Date.now()}`;
    
    setImageUrl(finalUrl);
    props.updateAttributes({ imageUrl: finalUrl }); // Update attribute on generation

    setTimeout(() => {
        setIsLoading(false);
    }, 1500);
  };
  
  return (
    <NodeViewWrapper className="ai-image-generator-node-view grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> Generator Controls</h4>
        <div className="space-y-2">
            <Label htmlFor="prompt-input">Prompt</Label>
            <Input id="prompt-input" value={prompt} onChange={(e) => {
                setPrompt(e.target.value);
                props.updateAttributes({ prompt: e.target.value });
            }} placeholder="Image description..."/>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="width-input">Width</Label>
                <Input id="width-input" type="number" value={width} onChange={(e) => {
                    const newWidth = parseInt(e.target.value, 10);
                    setWidth(newWidth);
                    props.updateAttributes({ width: newWidth });
                }}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="height-input">Height</Label>
                <Input id="height-input" type="number" value={height} onChange={(e) => {
                    const newHeight = parseInt(e.target.value, 10);
                    setHeight(newHeight);
                    props.updateAttributes({ height: newHeight });
                }}/>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="seed-slider">Seed: {seed}</Label>
            <Slider id="seed-slider" min={0} max={9999999999} step={1} value={[seed]} onValueChange={(val) => {
                setSeed(val[0]);
                props.updateAttributes({ seed: val[0] });
            }} />
        </div>
        <Button onClick={generateImage} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
            Generate
        </Button>
      </div>
      <div className="flex flex-col gap-2">
         <h4 className="font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Output</h4>
         <div className="relative w-full h-full min-h-[256px] border rounded-md bg-background flex items-center justify-center overflow-hidden">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                 </div>
            )}
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={prompt}
                    layout="fill"
                    objectFit="contain"
                    unoptimized
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            ) : (
                <p className="text-sm text-muted-foreground text-center p-4">Image will appear here</p>
            )}
         </div>
      </div>
    </NodeViewWrapper>
  );
};

const AIImageGeneratorNode = Node.create({
  name: 'aiImageGenerator',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      prompt: { default: '' },
      width: { default: 512 },
      height: { default: 512 },
      seed: { default: null },
      imageUrl: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'ai-image-generator' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ai-image-generator', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIImageGeneratorComponent);
  },

  addCommands() {
    return {
      insertAIImageGenerator: () => ({ commands }) => {
        return commands.insertContent('<ai-image-generator></ai-image-generator>');
      },
    };
  },
});

export default AIImageGeneratorNode;

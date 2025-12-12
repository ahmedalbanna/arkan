'use client';

import { ImageToSvgTool } from '@/components/writing-tools/ImageToSvgTool';
import { ImageUp } from 'lucide-react';

export default function ImageToSvgPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <ImageUp className="w-10 h-10" />
          Image to SVG Converter
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload an image and convert it to a scalable vector graphic (SVG) with advanced options.
        </p>
      </div>
      <ImageToSvgTool />
    </div>
  );
}

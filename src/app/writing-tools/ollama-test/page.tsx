
'use client';

import { OllamaTestTool } from '@/components/writing-tools/OllamaTestTool';
import { Server } from 'lucide-react';

export default function OllamaTestPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Server className="w-10 h-10" />
          Ollama Server Test Tool
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Use this tool to send a direct prompt to the configured Ollama server and verify its response.
        </p>
      </div>
      <OllamaTestTool />
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';

interface ResponseDisplayProps {
  prompt: string;
  response: string;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ prompt, response }) => {
  return (
    <div className="space-y-4">
      {/* User Prompt */}
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8 border">
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div className="mt-1 flex-1 space-y-2">
          <p className="font-semibold">You</p>
          <p className="text-muted-foreground">{prompt}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>🤖</AvatarFallback>
        </Avatar>
        <div className="mt-1 flex-1 space-y-2">
          <p className="font-semibold">AI Agent</p>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{response}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

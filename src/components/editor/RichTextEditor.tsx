
'use client';

import { BlockNoteViewRaw, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { AiAssistantMenu } from './AiAssistantMenu';
 
export default function RichTextEditor({ onTranslateClick }: { onTranslateClick: () => void }) {

  const editor = useBlockNote({
      
  },[]);
 
  return (
    <div className="flex-grow p-4 md:p-8 lg:p-12 bg-slate-200">
        <div className="relative mx-auto max-w-4xl min-h-full bg-white shadow-lg rounded-sm p-8 md:p-16">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                        <Sparkles className="w-4 h-4 mr-2"/>
                        AI Assistant
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-none" align="end">
                    <AiAssistantMenu />
                </PopoverContent>
            </Popover>
            <BlockNoteViewRaw editor={editor} theme="light" />
        </div>
    </div>
  );
}


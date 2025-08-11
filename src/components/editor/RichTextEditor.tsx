
'use client';

import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { AiAssistantMenu } from './AiAssistantMenu';
import dynamic from 'next/dynamic';

const BlockNoteView = dynamic(() => import("@blocknote/mantine").then((mod) => mod.BlockNoteView), {
    ssr: false,
  });

export default function RichTextEditor({ onTranslateClick }: { onTranslateClick: () => void }) {

    const editor:any = useCreateBlockNote({
        initialContent: [
          {
            type: "paragraph",
            content: "Welcome to this demo!",
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Blocks:",
                styles: { bold: true },
              },
            ],
          },
          {
            type: "paragraph",
            content: "Paragraph",
          },
          {
            type: "heading",
            content: "Heading",
          },
          {
            id: "toggle-heading",
            type: "heading",
            props: { isToggleable: true },
            content: "Toggle Heading",
          },
          {
            type: "quote",
            content: "Quote",
          },
          {
            type: "bulletListItem",
            content: "Bullet List Item",
          },
          {
            type: "numberedListItem",
            content: "Numbered List Item",
          },
          {
            type: "checkListItem",
            content: "Check List Item",
          },
          {
            id: "toggle-list-item",
            type: "toggleListItem",
            content: "Toggle List Item",
          },
          {
            type: "codeBlock",
            props: { language: "javascript" },
            content: "console.log('Hello, world!');",
          },
          {
            type: "table",
            content: {
              type: "tableContent",
              rows: [
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
              ],
            },
          },
          {
            type: "file",
          },
          {
            type: "image",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
            },
          },
          {
            type: "video",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
            },
          },
          {
            type: "audio",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
            },
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Inline Content:",
                styles: { bold: true },
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Styled Text",
                styles: {
                  bold: true,
                  italic: true,
                  textColor: "red",
                  backgroundColor: "blue",
                },
              },
              {
                type: "text",
                text: " ",
                styles: {},
              },
              {
                type: "link",
                content: "Link",
                href: "https://www.blocknotejs.org",
              },
            ],
          },
          {
            type: "paragraph",
          },
        ],
      });
 
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
            

        </div>
    </div>
  );
}


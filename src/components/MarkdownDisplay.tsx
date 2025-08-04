
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/markdown-components';
import { exportMarkdownAsDocx } from '@/lib/docx-exporter';
import { FileDown, Loader2 } from 'lucide-react';

export function MarkdownDisplay() {
  const [markdown, setMarkdown] = useState(`# Sample Markdown

## This is a heading

Paste your **Markdown** text on the left to see the styled output on the right.

-   Supports lists
-   And other standard elements

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`
`);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportMarkdownAsDocx(markdown, "markdown-export");
    setIsExporting(false);
  };


  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Markdown Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste your Markdown here..."
              className="h-full resize-none"
            />
          </CardContent>
           <CardFooter>
            <Button onClick={handleExport} disabled={isExporting || !markdown}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Export as DOCX
            </Button>
          </CardFooter>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-full rounded-md border p-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

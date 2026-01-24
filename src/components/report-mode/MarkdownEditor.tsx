// @ts-nocheck

'use client';

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/hooks/core/use-editor-store';
import { ContextualToolbar } from '@/lib/editor/ToolBar';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/lib/tiptap-extensions';
import { cn } from '@/lib/utils/cn';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import React from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Turndown Service Initialization
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

// Main Editor Component
interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  editorClassName?: string;
}

const MarkdownEditorComponent = ({ content, onChange, editorClassName }: MarkdownEditorProps) => {
  const { setActiveEditor } = useEditorStore();
  const bubbleMenuId = React.useId();

  const editor = useEditor({
    extensions: editorExtensions(bubbleMenuId),
    content: marked.parse(content) as string,
    onBlur: ({ editor }) => {
      const markdown = turndownService.turndown(editor.getHTML());
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn('prose dark:prose-invert max-w-none focus:outline-none font-serif text-base prose-p:text-base prose-headings:font-headline prose-a:text-primary hover:prose-a:text-primary/80 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2', editorClassName),
      },
      handlePaste: async (view, event, slice): Promise<boolean> => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        if (html) {
          return await handleHtmlPaste(editor!, html);
        }

        if (text) {
          return await handlePlainPaste(editor!, text);
        }

        return false;
      },
    },
    immediatelyRender: false,
  });

  // Set the global editor instance when it's created and destroy it on unmount
  React.useEffect(() => {
    if (editor) {
      setActiveEditor(editor);
    }
    return () => {
      setActiveEditor(null);
      editor?.destroy();
    };
  }, [editor, setActiveEditor]);

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editor && event.target === event.currentTarget) {
      editor.chain().focus().run();
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative text-base h-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          pluginKey={bubbleMenuId}
          shouldShow={({ editor }) => !editor.state.selection.empty}
        >
          {editor.isActive('table') ? (
            <div className="bg-background p-1 rounded-lg shadow-lg border flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Col Before</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Before</Button>
              <Button size="sm" variant="destructive" onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</Button>
            </div>
          ) : (
            <ContextualToolbar editor={editor} />
          )}
        </BubbleMenu>
      )}
      <div
        className="rounded-b-lg p-4 min-h-[200px] h-full relative transition-colors duration-300"
        onClick={handleWrapperClick}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
      </div>
    </ErrorBoundary>
  );
};

const MarkdownEditor = React.memo(MarkdownEditorComponent);

export default MarkdownEditor;

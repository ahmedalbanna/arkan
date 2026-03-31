'use client';

import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { BubbleMenu, EditorContent, useEditor, type Editor } from '@tiptap/react';
import React, { useState } from 'react';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/modules/ai-content/infrastructure/editor/tiptap-extensions';
import { useService } from '@/hooks/util/use-service';
import { IMarkdownServiceToken } from '@/infrastructure/di/tokens';
import { IMarkdownService } from '@/modules/ai-content/domain/services/IMarkdownService';
import { Button } from '@/components/ui/button';
import { ContextualToolbar } from '@/modules/ai-content/infrastructure/editor/editor/ToolBar';
import { cn } from '@/infrastructure/utils/cn';

// Standardized Editor Prose Configuration
// Matches A4Page.tsx for visual parity
export const EDITOR_PROSE_CLASSES = cn(
  'prose dark:prose-invert max-w-none focus:outline-none font-serif text-[16px] leading-[1.75] selection:bg-primary/20 transition-all duration-300',
  'prose-p:mb-6 prose-p:my-0',
  'prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0',
  'prose-strong:text-foreground prose-strong:font-black',
  'prose-blockquote:border-primary/40 prose-blockquote:bg-primary/[0.02] prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:rounded-r-xl prose-blockquote:not-italic',
  'prose-a:text-primary hover:prose-a:text-primary/80 transition-colors',
  'prose-img:rounded-2xl prose-img:shadow-2xl',
  'prose-table:w-full prose-table:border-collapse prose-table:my-8',
  'prose-th:border prose-th:border-border/60 prose-th:p-3 prose-th:bg-muted/30 prose-th:text-left prose-th:font-black prose-th:text-[11px] prose-th:uppercase prose-th:tracking-widest',
  'prose-td:border prose-td:border-border/60 prose-td:p-3 prose-td:align-top'
);

interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onDebouncedChange?: (markdown: string) => void;
  editorClassName?: string;
  debounceMs?: number;
}

const MarkdownEditorComponent = ({ 
  content, 
  onChange, 
  onDebouncedChange,
  editorClassName,
  debounceMs = 1000 
}: MarkdownEditorProps) => {
  const { setActiveEditor, updateSelectionState } = useEditorStore();
  const markdownService = useService<IMarkdownService>(IMarkdownServiceToken);
  const bubbleMenuId = React.useId();

  const editor = useEditor({
    extensions: editorExtensions(bubbleMenuId, markdownService),
    content: markdownService.toHtml(content),
    onUpdate: ({ editor }) => {
      // Notify the store about selection/state changes
      updateSelectionState(editor);
      
      if (onDebouncedChange) {
        const markdown = markdownService.toMarkdown(editor.getHTML());
        // Simple manual debounce
        const timer = (editor as any)._updateTimer;
        if (timer) clearTimeout(timer);
        (editor as any)._updateTimer = setTimeout(() => {
          onDebouncedChange(markdown);
        }, debounceMs);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      updateSelectionState(editor);
    },
    onBlur: ({ editor }) => {
      const markdown = markdownService.toMarkdown(editor.getHTML());
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(EDITOR_PROSE_CLASSES, editorClassName),
      },
      handlePaste: (view, event, slice): boolean => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        if (html) {
            void handleHtmlPaste(editor!, html);
            return true;
        }

        if (text) {
          void handlePlainPaste(editor!, text, markdownService);
          return true;
        }
        
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentHtml = editor.getHTML();
    const newHtml = markdownService.toHtml(content);

    // Only update if content is actually different to prevent cursor jumping
    // and only if the change came from outside (not while typing)
    if (newHtml !== currentHtml && !editor.isFocused) {
      editor.commands.setContent(newHtml, false);
      updateSelectionState(editor);
    }
  }, [content, editor, markdownService, updateSelectionState]);

  // Set the global editor instance
  React.useEffect(() => {
    if (editor) {
      setActiveEditor(editor);
      updateSelectionState(editor);
    }
    return () => {
      setActiveEditor(null);
    };
  }, [editor, setActiveEditor, updateSelectionState]);

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editor && event.target === event.currentTarget) {
      editor.chain().focus().run();
    }
  };

  return (
    <div className="relative text-base h-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ 
            duration: 200, 
            placement: 'top',
            animation: 'shift-away'
          }}
          pluginKey={bubbleMenuId}
          shouldShow={({ editor }) => !editor.state.selection.empty && !editor.isActive('image')}
        >
          {editor.isActive('table') ? (
            <div className="flex items-center gap-1.5 rounded-2xl border border-primary/10 bg-background/60 backdrop-blur-2xl p-1.5 shadow-2xl shadow-primary/5 transition-all duration-300">
                <div className="flex items-center gap-1 px-1">
                    <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest px-2 rounded-lg" onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest px-2 rounded-lg" onClick={() => editor.chain().focus().addRowBefore().run()}>+ Row</Button>
                </div>
                <div className="h-4 w-px bg-primary/10" />
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[9px] font-black uppercase tracking-widest px-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive" 
                    onClick={() => editor.chain().focus().deleteTable().run()}
                >
                    Delete Table
                </Button>
            </div>
          ) : (
            <ContextualToolbar editor={editor as Editor} />
          )}
        </BubbleMenu>
      )}
      <div
        className="rounded-b-lg p-0 min-h-[200px] h-full relative transition-colors duration-300"
        onClick={handleWrapperClick}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

const MarkdownEditor = React.memo(MarkdownEditorComponent);

export default MarkdownEditor;

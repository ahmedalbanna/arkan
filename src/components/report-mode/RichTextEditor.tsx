

'use client';

import { useEditorStore } from '@/hooks/core/use-editor-store';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import React, { useCallback, useEffect } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/lib/tiptap-extensions';
import { Button } from '@/components/ui/button';
import { ContextualToolbar } from '@/lib/editor/ToolBar';
import { useBuilderStore, useDebounce } from '@/hooks';

// Turndown Service Initialization
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

// Main Editor Component
interface RichTextEditorProps {
  content: string;
}

function RichTextEditor({ content }: RichTextEditorProps) {
  const { setActiveEditor } = useEditorStore();
  const { updateProject, setHasUnsavedChanges } = useBuilderStore();
  const uniqueId = React.useId();

  const handleContentUpdate = useCallback((newMarkdown: string) => {
    // Only update if there's a meaningful change
    if (newMarkdown !== useBuilderStore.getState().project?.fullMarkdownContent) {
      updateProject(p => p.updateContentFromMarkdown(newMarkdown));
      setHasUnsavedChanges(true);
    }
  }, [updateProject, setHasUnsavedChanges]);

  const editor = useEditor({
    extensions: editorExtensions(uniqueId),
    content: marked.parse(content) as string,
    onUpdate: ({ editor }) => {
      // This will now be debounced, see below
    },
    onBlur: ({ editor }) => {
      const markdown = turndownService.turndown(editor.getHTML());
      handleContentUpdate(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif text-base prose-p:text-base prose-headings:font-headline prose-a:text-primary hover:prose-a:text-primary/80 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
      },
      handlePaste: (view, event, slice) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        if (html) {
            handleHtmlPaste(editor!, html);
            return true;
        }

        if (text) {
          handlePlainPaste(editor!, text);
          return true;
        }
        
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Debounce the editor's HTML content
  const debouncedHtml = useDebounce(editor?.getHTML() || '', 1000);

  // Effect to sync editor with global state when it changes externally (e.g., loading a project)
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorMarkdown = turndownService.turndown(editor.getHTML());
      if (content !== editorMarkdown) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(marked.parse(content) as string, false);
        // Restore cursor position after content is set
        if (editor.state.doc.content.size >= to) {
          editor.commands.setTextSelection({ from, to });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Only run when the initial content prop changes

  // Effect for debounced updates
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const markdown = turndownService.turndown(debouncedHtml);
      handleContentUpdate(markdown);
    }
  }, [debouncedHtml, editor, handleContentUpdate]);


  // Set the global editor instance when it's created and destroy it on unmount
  useEffect(() => {
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
    <div className="relative text-base h-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top', onClose: () => false }}
          pluginKey={uniqueId}
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
  );
};

export default RichTextEditor;

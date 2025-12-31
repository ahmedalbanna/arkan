
'use client';

import { useEditorStore } from '@/hooks/core/use-editor-store';
import { handleFileDrop } from '@/lib/utils/drop-handler';
import { handleFilePaste, handleHtmlPaste, handlePlainPaste } from '@/lib/utils/paste-handler';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import React, { useEffect, useRef } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { editorExtensions } from '@/lib/tiptap-extensions';
import { Button } from '@/components/ui/button';
import { ContextualToolbar } from '@/lib/editor/ToolBar';

// Turndown Service Initialization
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

// Main Editor Component
interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const { setActiveEditor } = useEditorStore();
  const uniqueId = React.useId();
  
  const editor = useEditor({
    extensions: editorExtensions(uniqueId),
    content: marked.parse(content) as string,
    onSelectionUpdate: ({ editor }) => {
      setActiveEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif text-base prose-p:text-base prose-headings:font-headline prose-a:text-primary hover:prose-a:text-primary/80 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
      },
      handlePaste: (view, event, slice) => {
        const pastedFiles = Array.from(event.clipboardData?.files || []);
        if (editor && pastedFiles.length > 0) {
          pastedFiles.forEach(file => handleFilePaste(editor, file));
          return true; // We handled the paste
        }
        const html = event.clipboardData?.getData('text/html');
        const plain = event.clipboardData?.getData('text/plain');

        if (html && editor) {
          handleHtmlPaste(editor, html);
          return true; // We handled the paste
        } else if (editor && plain) {
          handlePlainPaste(editor, plain);
          return true; // We handled the paste
        }
        return false; // Let Tiptap handle default paste
      },
      handleDrop: (view, event, slice, moved) => {
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        if (editor && droppedFiles.length > 0) {
            droppedFiles.forEach(file => handleFileDrop(editor, file));
            return true; // We handled the drop
        }
        return false;
      }
    },
    immediatelyRender: false,
  });

  // Ref to track if there's a pending update from props
  const isUpdatingFromProps = useRef(false);

  // Effect to update editor content when the `content` prop changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentEditorMarkdown = turndownService.turndown(editor.getHTML());
      if (content !== currentEditorMarkdown) {
        isUpdatingFromProps.current = true;
        const { from, to } = editor.state.selection;
        editor.commands.setContent(marked.parse(content) as string, false);
        editor.commands.setTextSelection({ from, to });
        // After setting content, immediately turn the flag off
        // Use a timeout to ensure it happens after the transaction is fully applied
        setTimeout(() => {
          isUpdatingFromProps.current = false;
        }, 0);
      }
    }
  }, [content, editor]);
  
  // Effect to handle changes from the editor itself with debouncing
  useEffect(() => {
    if (!editor) return;

    let debounceTimeout: NodeJS.Timeout;

    const handleUpdate = () => {
      // If the editor is being updated by props, don't trigger the onChange callback
      if (isUpdatingFromProps.current) {
        return;
      }

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const markdown = turndownService.turndown(editor.getHTML());
        // Only call onChange if the markdown has actually changed
        if (markdown !== content) {
          onChange(markdown);
        }
      }, 1000); // 1-second debounce delay
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(debounceTimeout);
    };
  }, [editor, onChange, content]);


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
          shouldShow={({ editor, from, to }) => {
            return !editor.state.selection.empty;
          }}
        >
          {editor.isActive('table') ? (
            <div className="bg-background p-1 rounded-lg shadow-lg border flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Col Before</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Before</Button>
              <Button size="sm" variant="destructive" onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</Button>
            </div>
          ) : (
            <ContextualToolbar
              editor={editor}
            />
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


'use client';

import { useEditorStore } from '@/hooks/core/use-editor-store';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import React, { useEffect, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/lib/tiptap-extensions';
import { Button } from '@/components/ui/button';
import { ContextualToolbar } from '@/lib/editor/ToolBar';
import { useBuilderStore } from '@/hooks';

// Turndown Service Initialization
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

// Main Editor Component
interface RichTextEditorProps {
  content: string;
}

function RichTextEditor({ content }: RichTextEditorProps) {
  const { setActiveEditor } = useEditorStore();
  const { setContentFromMarkdown } = useBuilderStore();
  const uniqueId = React.useId();
  const [currentContent, setCurrentContent] = useState(content);

  const editor = useEditor({
    extensions: editorExtensions(uniqueId),
    content: marked.parse(currentContent) as string,
    onSelectionUpdate: ({ editor }) => {
      setActiveEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif text-base prose-p:text-base prose-headings:font-headline prose-a:text-primary hover:prose-a:text-primary/80 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
      },
       handlePaste: (view, event, slice) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        if (html) {
            handleHtmlPaste(view.state.tr.doc.type.schema.nodeFromJSON(slice.content.toJSON()), html);
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

  // Effect to update editor when external content changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorMarkdown = turndownService.turndown(editor.getHTML());
      if (content !== editorMarkdown) {
        // Only update if the external content is different
        // from the editor's current content.
        const { from, to } = editor.state.selection;
        editor.commands.setContent(marked.parse(content) as string, false);
        // Restore cursor position
        editor.commands.setTextSelection({ from, to });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);


  // Effect to update the global store with debouncing
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const markdown = turndownService.turndown(editor.getHTML());
      setCurrentContent(markdown);
    };

    const debounceTimeout = setTimeout(() => {
      if (content !== currentContent) {
        setContentFromMarkdown(currentContent);
      }
    }, 1000);

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(debounceTimeout);
    };
  }, [editor, currentContent, content, setContentFromMarkdown]);


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

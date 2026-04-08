'use client';

import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { BubbleMenu, EditorContent, useEditor, type Editor } from '@tiptap/react';
import React, { useMemo, useRef, useEffect } from 'react';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/modules/ai-content/infrastructure/editor/tiptap-extensions';
import { useService } from '@/hooks/util/use-service';
import { IMarkdownServiceToken } from '@/infrastructure/di/tokens';
import { IMarkdownService } from '@/modules/ai-content/domain/services/IMarkdownService';
import { Button } from '@/components/ui/button';
import { ContextualToolbar } from '@/modules/ai-content/infrastructure/editor/editor/ToolBar';
import { cn } from '@/infrastructure/utils/cn';
import { PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

// Performance: prevent `nodesBetween(0, pos, ...)` from becoming O(docSize)
// on frequent selection updates. Tune after profiling on real documents.
const HEADING_SCAN_LOOKBACK_POS = 15000;

// Correctness: when the nearest heading is outside the lookback window,
// occasionally do a full scan (throttled) rather than giving up entirely.
const FULL_HEADING_SCAN_COOLDOWN_MS = 800;

interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onDebouncedChange?: (markdown: string) => void;
  onActiveItemDetect?: (headingText: string | null) => void;
  editorClassName?: string;
  debounceMs?: number;
}

const MarkdownEditorComponent = ({
  content,
  onChange,
  onDebouncedChange,
  onActiveItemDetect,
  editorClassName,
  debounceMs = 1000
}: MarkdownEditorProps) => {
  const setActiveEditor = useEditorStore(state => state.setActiveEditor);
  const updateSelectionState = useEditorStore(state => state.updateSelectionState);
  const markdownService = useService<IMarkdownService>(IMarkdownServiceToken);
  const bubbleMenuId = React.useId();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleMenuRef = useRef<HTMLDivElement>(null);
  const lastActiveHeadingTextTrimmedRef = useRef<string | null>(null);
  const lastFullHeadingScanAtMsRef = useRef<number>(0);

  const extensions = useMemo(
    () => editorExtensions(bubbleMenuId, markdownService),
    [bubbleMenuId, markdownService]
  );

  const initialHtml = useMemo(() => markdownService.toHtml(content), [content, markdownService]);

  const editor = useEditor({
    extensions,
    content: initialHtml,
    onSelectionUpdate: ({ editor }) => {
      updateSelectionState(editor);
      if (!onActiveItemDetect) return;
      // Find nearest heading node above cursor position
      const { $anchor } = editor.state.selection;
      let headingText: string | null = null;
      for (let depth = $anchor.depth; depth >= 0; depth--) {
        const node = $anchor.node(depth);
        if (node.type.name === 'heading') {
          headingText = node.textContent;
          break;
        }
      }
      // Walk backwards through doc to find nearest heading before cursor
      // (but bounded to avoid scanning the entire document on every cursor move).
      if (!headingText) {
        const pos = $anchor.pos;
        const scanStart = Math.max(0, pos - HEADING_SCAN_LOOKBACK_POS);

        editor.state.doc.nodesBetween(scanStart, pos, (node) => {
          if (node.type.name === 'heading') {
            headingText = node.textContent;
          }
        });

        // If the heading is not within the lookback window, occasionally run
        // a full scan to avoid long-lived stale active-item state.
        if (!headingText) {
          const nowMs = performance.now();
          if (nowMs - lastFullHeadingScanAtMsRef.current >= FULL_HEADING_SCAN_COOLDOWN_MS) {
            lastFullHeadingScanAtMsRef.current = nowMs;
            editor.state.doc.nodesBetween(0, pos, (node) => {
              if (node.type.name === 'heading') {
                headingText = node.textContent;
              }
            });
          }
        }
      }

      const nextTrimmed = headingText?.trim() ? headingText.trim() : null;
      // Avoid spamming parent state with identical detections.
      if (nextTrimmed === lastActiveHeadingTextTrimmedRef.current) return;

      // Focus-gate: while the user is interacting with HUD/sidebars, we don't want
      // project context to "jump" due to selection updates caused by programmatic
      // `setContent(...)` calls.
      if (!editor.isFocused) return;

      lastActiveHeadingTextTrimmedRef.current = nextTrimmed;
      onActiveItemDetect(nextTrimmed);
    },
    onUpdate: ({ editor }) => {
      // Notify the store about selection/state changes
      updateSelectionState(editor);

      if (onDebouncedChange) {
        const markdown = markdownService.toMarkdown(editor.getHTML());
        // Simple manual debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onDebouncedChange(markdown);
        }, debounceMs);
      }
    },
    onBlur: ({ editor }) => {
      const markdown = markdownService.toMarkdown(editor.getHTML());
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(PROSE_CLASSES, editorClassName),
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

  useEffect(() => () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

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
    <div
      className="relative text-base h-full"
      tabIndex={0} // Makes the div focusable
      aria-label="Rich Text Editor" // Provides a descriptive label for screen readers
    >
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

export { MarkdownEditor };
export default MarkdownEditor;

'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { useService } from '@/hooks/util/use-service';
import { IMarkdownServiceToken } from '@/infrastructure/di/tokens';
import { cn } from '@/infrastructure/utils/cn';
import { PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { IMarkdownService } from '@/modules/ai-content/domain/services/IMarkdownService';
import { ContextualToolbar } from '@/modules/ai-content/infrastructure/editor/editor/ToolBar';
import { editorExtensions, handleHtmlPaste, handlePlainPaste } from '@/modules/ai-content/infrastructure/editor/tiptap-extensions';
import { BubbleMenu, EditorContent, useEditor, type Editor } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Performance constants
const HEADING_SCAN_LOOKBACK_POS = 15000;
const FULL_HEADING_SCAN_COOLDOWN_MS = 800;
const AUTO_SAVE_DELAY_MS = 2000;
const TYPING_DEBOUNCE_MS = 100;

interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onDebouncedChange?: (markdown: string) => void;
  onActiveItemDetect?: (headingText: string | null) => void;
  editorClassName?: string;
  debounceMs?: number;
  autoSave?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

const MarkdownEditorComponent = ({
  content,
  onChange,
  onDebouncedChange,
  onActiveItemDetect,
  editorClassName,
  debounceMs = 1000,
  autoSave = true,
  readOnly = false,
  placeholder = "Start writing...",
}: MarkdownEditorProps) => {
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  const setActiveEditor = useEditorStore(state => state.setActiveEditor);
  const updateSelectionState = useEditorStore(state => state.updateSelectionState);
  const markdownService = useService<IMarkdownService>(IMarkdownServiceToken);
  const bubbleMenuId = React.useId();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleMenuRef = useRef<HTMLDivElement>(null);
  const lastActiveHeadingTextTrimmedRef = useRef<string | null>(null);
  const lastFullHeadingScanAtMsRef = useRef<number>(0);
  const lastContentRef = useRef<string>(content);
  const [isTyping, setIsTyping] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const extensions = useMemo(
    () => editorExtensions(bubbleMenuId, markdownService),
    [bubbleMenuId, markdownService]
  );

  const initialHtml = useMemo(() => markdownService.toHtml(content), [content, markdownService]);

  // Calculate word and character count
  const updateCounts = useCallback((markdown: string) => {
    const words = markdown.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = markdown.replace(/\s/g, '').length;
    setWordCount(words);
    setCharCount(chars);
  }, []);

  // Handle content changes with debouncing and auto-save
  const handleContentChange = useCallback((markdown: string) => {
    updateCounts(markdown);

    if (autoSave && autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        onChange(markdown);
        lastContentRef.current = markdown;
      }, AUTO_SAVE_DELAY_MS);
    }

    if (onDebouncedChange) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onDebouncedChange(markdown);
      }, debounceMs);
    }
  }, [autoSave, onChange, onDebouncedChange, debounceMs, updateCounts]);

  const editor = useEditor({
    extensions,
    content: initialHtml,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: cn(PROSE_CLASSES, editorClassName),
        'data-placeholder': placeholder,
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
      handleKeyDown: (view, event) => {
        // Desktop keyboard shortcuts
        if (isDesktop) {
          // Ctrl/Cmd + B for bold
          if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
            event.preventDefault();
            editor?.chain().focus().toggleBold().run();
            return true;
          }
          // Ctrl/Cmd + I for italic
          if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
            event.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            return true;
          }
          // Ctrl/Cmd + K for link
          if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const url = window.prompt('Enter URL:');
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
            return true;
          }
          // Ctrl/Cmd + Shift + 1-3 for headings
          if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
            const level = parseInt(event.key, 10);
            if (level >= 1 && level <= 3) {
              event.preventDefault();
              editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              return true;
            }
          }
          // Tab key for lists
          if (event.key === 'Tab') {
            if (editor?.isActive('listItem')) {
              event.preventDefault();
              editor.chain().focus().sinkListItem('listItem').run();
              return true;
            }
          }
          // Shift + Tab for outdent lists
          if (event.key === 'Tab' && event.shiftKey) {
            if (editor?.isActive('listItem')) {
              event.preventDefault();
              editor.chain().focus().liftListItem('listItem').run();
              return true;
            }
          }
        }
        return false;
      },
    },
    onSelectionUpdate: ({ editor }) => {
      updateSelectionState(editor);
      if (!onActiveItemDetect) return;

      const { $anchor } = editor.state.selection;
      let headingText: string | null = null;

      for (let depth = $anchor.depth; depth >= 0; depth--) {
        const node = $anchor.node(depth);
        if (node.type.name === 'heading') {
          headingText = node.textContent;
          break;
        }
      }

      if (!headingText) {
        const pos = $anchor.pos;
        const scanStart = Math.max(0, pos - HEADING_SCAN_LOOKBACK_POS);

        editor.state.doc.nodesBetween(scanStart, pos, (node) => {
          if (node.type.name === 'heading') {
            headingText = node.textContent;
          }
        });

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
      if (nextTrimmed === lastActiveHeadingTextTrimmedRef.current) return;
      if (!editor.isFocused) return;

      lastActiveHeadingTextTrimmedRef.current = nextTrimmed;
      onActiveItemDetect(nextTrimmed);
    },
    onUpdate: ({ editor }) => {
      updateSelectionState(editor);
      const markdown = markdownService.toMarkdown(editor.getHTML());
      setIsTyping(true);
      handleContentChange(markdown);

      // Reset typing indicator after delay
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_DEBOUNCE_MS);
    },
    onBlur: ({ editor }) => {
      const markdown = markdownService.toMarkdown(editor.getHTML());
      onChange(markdown);
      setIsTyping(false);
    },
    onFocus: () => {
      setIsTyping(false);
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentHtml = editor.getHTML();
    const newHtml = markdownService.toHtml(content);

    if (newHtml !== currentHtml && !editor.isFocused && content !== lastContentRef.current) {
      editor.commands.setContent(newHtml, false);
      updateSelectionState(editor);
      updateCounts(content);
      lastContentRef.current = content;
    }
  }, [content, editor, markdownService, updateSelectionState, updateCounts]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Set global editor instance
  useEffect(() => {
    if (editor) {
      setActiveEditor(editor);
      updateSelectionState(editor);
      updateCounts(content);
    }
    return () => {
      setActiveEditor(null);
    };
  }, [editor, setActiveEditor, updateSelectionState, updateCounts, content]);

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editor && event.target === event.currentTarget) {
      editor.chain().focus().run();
    }
  };

  // Desktop keyboard shortcuts hint component
  const KeyboardShortcutsHint = () => {
    if (!isDesktop || readOnly) return null;

    return (
      <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[9px] font-mono text-muted-foreground/60 border border-primary/10">
          ⌘B • ⌘I • ⌘K • ⌘⇧1-3
        </div>
      </div>
    );
  };

  // Status bar for desktop
  const StatusBar = () => {
    if (!isDesktop || readOnly) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-background/80 backdrop-blur-sm border-t border-primary/10 px-3 flex items-center justify-between text-[9px] font-mono text-muted-foreground/40 z-10">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-3">
          {isTyping && (
            <span className="text-primary/60 animate-pulse">Typing...</span>
          )}
          {autoSave && !isTyping && lastContentRef.current === content && (
            <span className="text-green-500/60">Saved</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative text-base h-full group">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 200,
            placement: 'top',
            animation: 'shift-away',
            zIndex: 50,
          }}
          pluginKey={bubbleMenuId}
          shouldShow={({ editor }) => !editor.state.selection.empty && !editor.isActive('image')}
        >
          {editor.isActive('table') ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl p-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest px-2 rounded-md" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                      + Col
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[9px]">Add column before</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest px-2 rounded-md" onClick={() => editor.chain().focus().addRowBefore().run()}>
                      + Row
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[9px]">Add row before</TooltipContent>
                </Tooltip>
                <div className="h-4 w-px bg-primary/10" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[9px] font-black uppercase tracking-widest px-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => editor.chain().focus().deleteTable().run()}
                    >
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[9px]">Delete table</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <ContextualToolbar editor={editor as Editor} />
          )}
        </BubbleMenu>
      )}

      <div
        className={cn(
          "rounded-b-lg p-0 min-h-[200px] h-full relative transition-colors duration-300",
          readOnly && "cursor-default"
        )}
        onClick={handleWrapperClick}
      >
        <EditorContent editor={editor} className="h-full" />
        {!editor?.isFocused && !content && !readOnly && (
          <div className="absolute top-0 left-0 right-0 pointer-events-none text-muted-foreground/30 text-sm font-serif italic px-4 py-2">
            {placeholder}
          </div>
        )}
      </div>

      <KeyboardShortcutsHint />
      <StatusBar />
    </div>
  );
};

const MarkdownEditor = React.memo(MarkdownEditorComponent);

export { MarkdownEditor };
export default MarkdownEditor;

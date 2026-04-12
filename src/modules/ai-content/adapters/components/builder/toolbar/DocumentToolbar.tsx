'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { Project } from '@/modules/projects/domain/entities/Project';
import { formatDistanceToNow } from 'date-fns';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Clock,
  Code,
  Download,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  PenLine,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Undo2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SPRING_EASE } from '../layout/motion';

interface DocumentToolbarProps {
  project: Project | null;
  viewMode: 'edit' | 'preview';
  setViewMode: (mode: 'edit' | 'preview') => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  suggestion: string;
  isDesktop?: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  className?: string;
}

/**
 * DocumentToolbar — Central control bar for document viewing and editing.
 * Provides status indicators, view toggles, and formatting tools.
 */
export const DocumentToolbar = ({
  project,
  viewMode,
  setViewMode,
  isFullscreen,
  onToggleFullscreen,
  suggestion,
  onSave,
  onExport,
  onPrint,
  className,
}: DocumentToolbarProps) => {
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  const activeEditor = useEditorStore((state) => state.activeEditor);
  const selection = useEditorStore((state) => state.selection);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Simulate auto-save indicator
  useEffect(() => {
    if (onSave) {
      const interval = setInterval(() => {
        setLastSaved(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [onSave]);

  const handleEditorAction = useCallback((action: () => void) => {
    if (!activeEditor) return;
    action();
    activeEditor.commands.focus();
  }, [activeEditor]);

  const handleToggleHeading = useCallback((level: 1 | 2 | 3) => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleHeading({ level }).run();
  }, [activeEditor]);

  const handleToggleAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (!activeEditor) return;
    activeEditor.chain().focus().setTextAlign(align).run();
  }, [activeEditor]);

  const handleInsertLink = useCallback(() => {
    if (!activeEditor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      (activeEditor.chain().focus() as any).setLink({ href: url }).run();
    }
  }, [activeEditor]);

  const handleInsertImage = useCallback(() => {
    if (!activeEditor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      activeEditor.chain().focus().setImage({ src: url }).run();
    }
  }, [activeEditor]);

  const handleInsertHorizontalRule = useCallback(() => {
    if (!activeEditor) return;
    activeEditor.chain().focus().setHorizontalRule().run();
  }, [activeEditor]);

  const canEdit = viewMode === 'edit' && !!activeEditor;

  // Keyboard shortcuts display
  const shortcuts = [
    { keys: ['Ctrl', 'B'], action: 'Bold' },
    { keys: ['Ctrl', 'I'], action: 'Italic' },
    { keys: ['Ctrl', 'Z'], action: 'Undo' },
    { keys: ['Ctrl', 'Y'], action: 'Redo' },
    { keys: ['Ctrl', 'P'], action: 'Preview' },
    { keys: ['Ctrl', 'E'], action: 'Edit' },
    { keys: ['F11'], action: 'Fullscreen' },
  ];

  return (
    <div
      className={cn(
        'sticky top-0 z-40 flex flex-col gap-2 px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-xl',
        className
      )}
    >
      {/* Main Toolbar Row */}
      <div className="flex items-center justify-between">
        {/* Left — Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-[0.22em] bg-background/70 px-2.5 py-1 rounded-full border border-border/30 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
            {isDesktop && 'Connected'}
          </div>

          {/* Last Saved Indicator */}
          {isDesktop && lastSaved && (
            <>
              <div className="w-px h-4 bg-border/40" aria-hidden />
              <span className="text-[9px] text-muted-foreground/40 font-mono">
                Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </span>
            </>
          )}

          {/* Project Updated Time */}
          {isDesktop && project?.meta.updated && (
            <>
              <div className="w-px h-4 bg-border/40" aria-hidden />
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50 font-bold uppercase tracking-[0.15em]">
                <Clock className="h-2.5 w-2.5 opacity-50" />
                {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
              </span>
            </>
          )}
        </div>

        {/* Center — Document Title (Desktop) */}
        {isDesktop && project && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              {project.name || 'Untitled Document'}
            </span>
          </div>
        )}

        {/* Right — Action Buttons */}
        <div className="flex items-center gap-0.5">
          {/* Save Button - Desktop */}
          {isDesktop && onSave && viewMode === 'edit' && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Save document"
                    className="h-7 w-7 rounded-lg hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-200"
                    onClick={onSave}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em]">
                  Save • Ctrl+S
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Export Dropdown - Desktop */}
          {isDesktop && (onExport || onPrint) && (
            <DropdownMenu>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-200"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em]">
                    Export
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-primary/10 shadow-xl">
                <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-wider">Export As</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onExport && (
                  <DropdownMenuItem onClick={onExport} className="text-[10px] font-medium">
                    Markdown (.md)
                  </DropdownMenuItem>
                )}
                {onPrint && (
                  <DropdownMenuItem onClick={onPrint} className="text-[10px] font-medium">
                    Print / PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View Mode Toggle */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={viewMode === 'edit' ? 'Preview Document' : 'Edit Document'}
                  className={cn(
                    'h-7 w-7 rounded-lg transition-all duration-200',
                    viewMode === 'edit'
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
                  )}
                  style={{ transitionTimingFunction: `cubic-bezier(${SPRING_EASE.join(',')})` }}
                  onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                >
                  {viewMode === 'edit' ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <PenLine className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em]">
                {viewMode === 'edit' ? 'Preview Mode' : 'Edit Mode'}
                <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">
                  {viewMode === 'edit' ? 'Ctrl+P' : 'Ctrl+E'}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-4 bg-border/40 mx-1.5" aria-hidden />

          {/* Fullscreen Toggle */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="h-7 w-7 rounded-lg hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-200"
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em]">
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">F11</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Assistant Button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Writing assistant and suggestions"
                  className="h-7 text-[9px] font-black uppercase tracking-[0.18em] gap-1.5 px-2.5 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-muted-foreground transition-all duration-200"
                >
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  {isDesktop && 'Assistant'}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px] p-4 space-y-2 bg-background/95 backdrop-blur-md border-primary/20 mt-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  Writing Assistant
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                  {suggestion}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Keyboard Shortcuts Toggle - Desktop */}
          {isDesktop && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className="h-7 w-7 rounded-lg hover:bg-primary/5 text-muted-foreground"
                  >
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      showShortcuts && "rotate-180"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em]">
                  Keyboard Shortcuts
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Panel - Desktop */}
      {isDesktop && showShortcuts && (
        <div className="mt-2 p-3 rounded-xl bg-muted/5 border border-primary/10 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-4 gap-2">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground/60">{shortcut.action}</span>
                <div className="flex items-center gap-0.5">
                  {shortcut.keys.map((key, kidx) => (
                    <kbd key={kidx} className="px-1.5 py-0.5 bg-muted/50 rounded text-[8px] font-mono font-bold">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formatting Toolbar - Edit Mode Only */}
      {viewMode === 'edit' && (
        <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-background/70 px-2 py-1.5 overflow-x-auto no-scrollbar">
          {isDesktop && (
            <>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1.5">
                Format
              </span>
              <div className="w-px h-4 bg-border/40" aria-hidden />
            </>
          )}

          <TooltipProvider delayDuration={200}>
            {/* Text Formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Bold text"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isBold && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBold().run())}
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Bold • Ctrl+B</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Italic text"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isItalic && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleItalic().run())}
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Italic • Ctrl+I</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Strikethrough text"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isStrike && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleStrike().run())}
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Strikethrough • Ctrl+Shift+X</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

            {/* Headings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Heading 1"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 1 && 'bg-primary/10 text-primary')}
                  onClick={() => handleToggleHeading(1)}
                >
                  <Heading1 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Heading 1 • Ctrl+Alt+1</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Heading 2"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 2 && 'bg-primary/10 text-primary')}
                  onClick={() => handleToggleHeading(2)}
                >
                  <Heading2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Heading 2 • Ctrl+Alt+2</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Heading 3"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 3 && 'bg-primary/10 text-primary')}
                  onClick={() => handleToggleHeading(3)}
                >
                  <Heading3 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Heading 3 • Ctrl+Alt+3</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Bullet list"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isBulletList && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBulletList().run())}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Bullet List • Ctrl+Shift+8</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Numbered list"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isOrderedList && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleOrderedList().run())}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Numbered List • Ctrl+Shift+7</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

            {/* Alignment - Desktop */}
            {isDesktop && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Align left"
                      disabled={!canEdit}
                      className={cn('h-7 w-7 rounded-lg', selection.textAlign === 'left' && 'bg-primary/10 text-primary')}
                      onClick={() => handleToggleAlign('left')}
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Align Left • Ctrl+Shift+L</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Align center"
                      disabled={!canEdit}
                      className={cn('h-7 w-7 rounded-lg', selection.textAlign === 'center' && 'bg-primary/10 text-primary')}
                      onClick={() => handleToggleAlign('center')}
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Align Center • Ctrl+Shift+C</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Align right"
                      disabled={!canEdit}
                      className={cn('h-7 w-7 rounded-lg', selection.textAlign === 'right' && 'bg-primary/10 text-primary')}
                      onClick={() => handleToggleAlign('right')}
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Align Right • Ctrl+Shift+R</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />
              </>
            )}

            {/* Block Elements */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Blockquote"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isBlockquote && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBlockquote().run())}
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Blockquote • Ctrl+Shift+B</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Code block"
                  disabled={!canEdit}
                  className={cn('h-7 w-7 rounded-lg', selection.isCodeBlock && 'bg-primary/10 text-primary')}
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleCodeBlock().run())}
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Code Block • Ctrl+Alt+C</TooltipContent>
            </Tooltip>

            {/* Insert Elements - Desktop */}
            {isDesktop && (
              <>
                <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Insert link"
                      disabled={!canEdit}
                      className="h-7 w-7 rounded-lg"
                      onClick={handleInsertLink}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Insert Link • Ctrl+K</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Insert image"
                      disabled={!canEdit}
                      className="h-7 w-7 rounded-lg"
                      onClick={handleInsertImage}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Insert Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Insert horizontal rule"
                      disabled={!canEdit}
                      className="h-7 w-7 rounded-lg"
                      onClick={handleInsertHorizontalRule}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">Horizontal Rule</TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Undo"
                  disabled={!canEdit}
                  className="h-7 w-7 rounded-lg"
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().undo().run())}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Undo • Ctrl+Z</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Redo"
                  disabled={!canEdit}
                  className="h-7 w-7 rounded-lg"
                  onClick={() => handleEditorAction(() => activeEditor?.chain().focus().redo().run())}
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[9px]">Redo • Ctrl+Y</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

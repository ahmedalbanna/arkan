'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { container } from '@/infrastructure/di/container';
import { cn } from '@/infrastructure/utils/cn';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { PromptBuilder } from '@/modules/ai-content/domain/services/PromptBuilder';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  Maximize2,
  Minimize2,
  Printer,
  Search,
  Settings2,
  Terminal,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface PromptInspectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
}

interface SearchMatch {
  start: number;
  end: number;
  text: string;
}

export function PromptInspector({ isOpen, onOpenChange, section }: PromptInspectorProps) {
  const project = useBuilderStore(state => state.project);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('raw');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const preRef = useRef<HTMLPreElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (!project) return null;

  const fullPrompt = useMemo(
    () => container.resolve(PromptBuilder).buildSectionPrompt(section, project),
    [project, section]
  );

  // Calculate prompt stats
  const stats = useMemo(() => {
    const characters = fullPrompt.length;
    const words = fullPrompt.split(/\s+/).filter(w => w.length > 0).length;
    const lines = fullPrompt.split('\n').length;
    const tokens = Math.ceil(characters / 4); // Approximate token count
    return { characters, words, lines, tokens };
  }, [fullPrompt]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: SearchMatch[] = [];
    let index = 0;

    while (index < fullPrompt.length) {
      const foundIndex = fullPrompt.toLowerCase().indexOf(query, index);
      if (foundIndex === -1) break;
      matches.push({
        start: foundIndex,
        end: foundIndex + query.length,
        text: fullPrompt.substring(foundIndex, foundIndex + query.length)
      });
      index = foundIndex + 1;
    }

    setSearchMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery, fullPrompt]);

  // Highlight text in pre element
  useEffect(() => {
    if (!preRef.current || !searchQuery.trim() || searchMatches.length === 0) return;

    const highlightMatches = () => {
      const container = preRef.current;
      if (!container) return;

      const text = fullPrompt;
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlighted = text.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>');

      // Only highlight current match specially
      if (currentMatchIndex >= 0 && searchMatches[currentMatchIndex]) {
        const match = searchMatches[currentMatchIndex];
        const beforeMatch = text.substring(0, match.start);
        const matchText = text.substring(match.start, match.end);
        const afterMatch = text.substring(match.end);

        const highlightedWithCurrent =
          beforeMatch.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>') +
          `<mark class="bg-yellow-500/80 text-yellow-100 rounded px-0.5 ring-2 ring-yellow-400">${matchText}</mark>` +
          afterMatch.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>');

        container.innerHTML = highlightedWithCurrent;
      } else {
        container.innerHTML = highlighted;
      }
    };

    highlightMatches();

    // Scroll to current match
    if (currentMatchIndex >= 0 && searchMatches[currentMatchIndex]) {
      const marks = preRef.current?.querySelectorAll('mark');
      if (marks && marks[currentMatchIndex]) {
        marks[currentMatchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      if (preRef.current) {
        preRef.current.innerHTML = fullPrompt;
      }
    };
  }, [searchQuery, searchMatches, currentMatchIndex, fullPrompt]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullPrompt]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([fullPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${section.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fullPrompt, section.title]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
                <html>
                    <head>
                        <title>AI Prompt - ${section.title}</title>
                        <style>
                            body { font-family: monospace; padding: 40px; line-height: 1.6; }
                            pre { white-space: pre-wrap; word-wrap: break-word; }
                        </style>
                    </head>
                    <body>
                        <h1>AI Instruction Matrix</h1>
                        <h2>Section: ${section.title}</h2>
                        <pre>${fullPrompt}</pre>
                        <hr />
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </body>
                </html>
            `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [fullPrompt, section.title]);

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    let newIndex = currentMatchIndex;
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % searchMatches.length;
    } else {
      newIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    }
    setCurrentMatchIndex(newIndex);
  }, [searchMatches.length, currentMatchIndex]);

  // Format prompt with line numbers
  const promptWithLineNumbers = useMemo(() => {
    const lines = fullPrompt.split('\n');
    return lines.map((line, index) => `${(index + 1).toString().padStart(4, ' ')} │ ${line}`).join('\n');
  }, [fullPrompt]);

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + G to next match
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        navigateMatch('next');
      }
      // Ctrl/Cmd + Shift + G to previous match
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        navigateMatch('prev');
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
      // Ctrl/Cmd + L to toggle line numbers
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setShowLineNumbers(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchQuery, navigateMatch]);

  const displayedPrompt = showLineNumbers ? promptWithLineNumbers : fullPrompt;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/95 backdrop-blur-xl",
          isFullscreen ? "max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]" : "max-w-6xl max-h-[90vh] w-[90vw]",
          "min-w-[800px]"
        )}
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-primary/10 bg-primary/[0.03] relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle className="text-[13px] font-black uppercase tracking-[0.3em]">
                    AI Instruction Matrix
                  </DialogTitle>
                  <Badge variant="outline" className="h-5 text-[8px] font-mono border-primary/20 bg-primary/5">
                    {stats.tokens.toLocaleString()} tokens
                  </Badge>
                </div>
                <DialogDescription className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed">
                  Section: <span className="text-foreground font-black italic">"{section.title}"</span>
                </DialogDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDownload}
                      className="h-8 w-8 rounded-lg"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">
                    Download as text file
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrint}
                      className="h-8 w-8 rounded-lg"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">
                    Print
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-8 w-8 rounded-lg"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">
                    {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Tabs */}
        {(
          <div className="px-6 pt-3 border-b border-primary/10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-8">
                <TabsTrigger value="raw" className="text-[9px] font-black uppercase tracking-wider data-[state=active]:bg-primary/10">
                  <Code2 className="h-3 w-3 mr-1.5" />
                  Raw Prompt
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-[9px] font-black uppercase tracking-wider data-[state=active]:bg-primary/10">
                  <Eye className="h-3 w-3 mr-1.5" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-primary/10 bg-muted/5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <Input
                ref={searchInputRef}
                placeholder="Search prompt... (⌘F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-9 pr-20 text-[11px] font-mono bg-background/50 border-primary/10 rounded-lg"
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-[9px] font-mono text-muted-foreground/40">
                    {searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0'}
                  </span>
                  {searchMatches.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMatch('prev')}
                        className="h-6 w-6 rounded"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMatch('next')}
                        className="h-6 w-6 rounded"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="h-6 w-6 rounded"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {(
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowLineNumbers(!showLineNumbers)}
                      className={cn(
                        "h-8 w-8 rounded-lg",
                        showLineNumbers && "bg-primary/10 text-primary"
                      )}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px]">
                    Toggle line numbers • ⌘L
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopy}
                    className="h-8 px-3 gap-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px]">
                  Copy to clipboard
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative bg-[#0d1117]/95 dark:bg-black/60">
          <ScrollArea className="h-[55vh] w-full custom-scrollbar">
            <div className="p-6 pb-24">
              {activeTab === 'raw' ? (
                <pre
                  ref={preRef}
                  className={cn(
                    "font-mono leading-relaxed text-blue-100/80 selection:bg-primary/30 whitespace-pre-wrap",
                    "text-[13px]"
                  )}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {displayedPrompt}
                </pre>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm text-blue-100/80">
                    {fullPrompt}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] dark:from-black to-transparent pointer-events-none z-20" />
          </ScrollArea>
        </div>

        {/* Footer Stats */}
        <footer className="px-6 py-3 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between shrink-0 text-[8px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileCode className="h-3 w-3 text-muted-foreground/30" />
              <span className="font-mono text-muted-foreground/40">
                {stats.characters.toLocaleString()} chars
              </span>
            </div>
            <div className="h-3 w-px bg-primary/10" />
            <span className="font-mono text-muted-foreground/40">
              {stats.words.toLocaleString()} words
            </span>
            <div className="h-3 w-px bg-primary/10" />
            <span className="font-mono text-muted-foreground/40">
              {stats.lines} lines
            </span>
            {(
              <>
                <div className="h-3 w-px bg-primary/10" />
                <span className="font-mono text-muted-foreground/40">
                  ~{stats.tokens.toLocaleString()} tokens
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  className="h-6 w-6 rounded text-[9px]"
                >
                  A-
                </Button>
                <span className="text-[9px] font-mono text-muted-foreground/40 w-8 text-center">
                  {fontSize}px
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                  className="h-6 w-6 rounded text-[9px]"
                >
                  A+
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-[9px] font-black uppercase tracking-[0.2em] h-7 px-4 rounded-lg transition-all hover:bg-muted/10"
            >
              Close
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

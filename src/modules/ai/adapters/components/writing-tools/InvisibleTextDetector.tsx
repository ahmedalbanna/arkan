'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/infrastructure/utils/cn';
import { 
    AlertCircle, 
    Check, 
    Copy, 
    Eye, 
    EyeOff, 
    Info, 
    Trash2, 
    Search, 
    ShieldCheck, 
    Layers, 
    Zap, 
    Terminal,
    Fingerprint,
    CheckCircle2,
    Database,
    ArrowRight
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';

type ReplacementType = 'remove' | 'space' | 'keep' | 'replace';

interface UnicodeCharacter {
  code: string;
  name: string;
  visible: boolean;
  description: string;
  example: string;
  replacementType: ReplacementType;
  replacementValue?: string; // For 'replace' type
  count: number;
}

// Complete list of invisible and problematic Unicode characters
const UNICODE_CHARS: Record<string, Omit<UnicodeCharacter, 'count' | 'positions'>> = {
  // Regular characters (kept as-is)
  '\u0020': { code: 'U+0020', name: 'Regular Space', visible: true, description: 'Regular Space', example: 'word word', replacementType: 'keep' },
  '\u000A': { code: 'U+000A', name: 'Line Feed', visible: true, description: 'New Line', example: 'word\nword', replacementType: 'keep' },
  
  // Problematic spaces
  '\u00A0': { code: 'U+00A0', name: 'No-Break Space', visible: true, description: 'No-Break Space', example: 'word word', replacementType: 'space' },
  '\u1680': { code: 'U+1680', name: 'Ogham Space Mark', visible: false, description: 'Ogham Space Mark', example: 'word word', replacementType: 'space' },
  '\u2000': { code: 'U+2000', name: 'En Quad', visible: false, description: 'En Quad Space', example: 'word word', replacementType: 'space' },
  '\u2001': { code: 'U+2001', name: 'Em Quad', visible: false, description: 'Em Quad Space', example: 'word word', replacementType: 'space' },
  '\u2002': { code: 'U+2002', name: 'En Space', visible: false, description: 'En Space', example: 'word word', replacementType: 'space' },
  '\u2003': { code: 'U+2003', name: 'Em Space', visible: false, description: 'Em Space', example: 'word word', replacementType: 'space' },
  '\u2004': { code: 'U+2004', name: 'Three-Per-Em Space', visible: false, description: 'Three-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2005': { code: 'U+2005', name: 'Four-Per-Em Space', visible: false, description: 'Four-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2006': { code: 'U+2006', name: 'Six-Per-Em Space', visible: false, description: 'Six-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2007': { code: 'U+2007', name: 'Figure Space', visible: false, description: 'Figure Space', example: 'word word', replacementType: 'space' },
  '\u2008': { code: 'U+2008', name: 'Punctuation Space', visible: false, description: 'Punctuation Space', example: 'word word', replacementType: 'space' },
  '\u2009': { code: 'U+2009', name: 'Thin Space', visible: false, description: 'Thin Space', example: 'word word', replacementType: 'space' },
  '\u200A': { code: 'U+200A', name: 'Hair Space', visible: false, description: 'Hair Space', example: 'word word', replacementType: 'space' },
  '\u202F': { code: 'U+202F', name: 'Narrow No-Break Space', visible: false, description: 'Narrow No-Break Space', example: 'word word', replacementType: 'space' },
  '\u205F': { code: 'U+205F', name: 'Medium Mathematical Space', visible: false, description: 'Medium Mathematical Space', example: 'word word', replacementType: 'space' },
  '\u3000': { code: 'U+3000', name: 'Ideographic Space', visible: false, description: 'Ideographic Space', example: 'word　word', replacementType: 'space' },

  // Zero-width characters (Injected by LLMs)
  '\u200B': { code: 'U+200B', name: 'Zero-Width Space', visible: false, description: 'Zero-Width Space', example: 'word​word', replacementType: 'remove' },
  '\u200C': { code: 'U+200C', name: 'Zero-Width Non-Joiner', visible: false, description: 'Zero-Width Non-Joiner', example: 'word‌word', replacementType: 'remove' },
  '\u200D': { code: 'U+200D', name: 'Zero-Width Joiner', visible: false, description: 'Zero-Width Joiner', example: 'word‍word', replacementType: 'remove' },
  '\uFEFF': { code: 'U+FEFF', name: 'Zero-Width No-Break Space', visible: false, description: 'Zero-Width No-Break Space (BOM)', example: 'word﻿word', replacementType: 'remove' },

  // Control characters
  '\u200E': { code: 'U+200E', name: 'Left-To-Right Mark', visible: false, description: 'Left-To-Right Mark', example: '', replacementType: 'remove' },
  '\u200F': { code: 'U+200F', name: 'Right-To-Left Mark', visible: false, description: 'Right-To-Left Mark', example: '', replacementType: 'remove' },
  '\u202A': { code: 'U+202A', name: 'Left-To-Right Embedding', visible: false, description: 'Left-To-Right Embedding', example: '', replacementType: 'remove' },
  '\u202B': { code: 'U+202B', name: 'Right-To-Left Embedding', visible: false, description: 'Right-To-Left Embedding', example: '', replacementType: 'remove' },
  '\u202C': { code: 'U+202C', name: 'Pop Directional Formatting', visible: false, description: 'Pop Directional Formatting', example: '', replacementType: 'remove' },
  '\u202D': { code: 'U+202D', name: 'Left-To-Right Override', visible: false, description: 'Left-To-Right Override', example: '', replacementType: 'remove' },
  '\u202E': { code: 'U+202E', name: 'Right-To-Left Override', visible: false, description: 'Right-To-Left Override', example: '', replacementType: 'remove' },

  // Format characters
  '\u2060': { code: 'U+2060', name: 'Word Joiner', visible: false, description: 'Word Joiner', example: '', replacementType: 'remove' },
  '\u2061': { code: 'U+2061', name: 'Function Application', visible: false, description: 'Function Application', example: '', replacementType: 'remove' },
  '\u2062': { code: 'U+2062', name: 'Invisible Times', visible: false, description: 'Invisible Times', example: '', replacementType: 'replace', replacementValue: 'x' },
  '\u2063': { code: 'U+2063', name: 'Invisible Separator', visible: false, description: 'Invisible Separator', example: '', replacementType: 'remove' },
  '\u2064': { code: 'U+2064', name: 'Invisible Plus', visible: false, description: 'Invisible Plus', example: '', replacementType: 'replace', replacementValue: '+' },

  // Problematic visible characters
  '\u2010': { code: 'U+2010', name: 'Hyphen', visible: true, description: 'Standard Hyphen', example: 'word‐word', replacementType: 'keep' },
  '\u2013': { code: 'U+2013', name: 'En Dash', visible: true, description: 'En Dash', example: 'word–word', replacementType: 'keep' },
  '\u2014': { code: 'U+2014', name: 'Em Dash', visible: true, description: 'Em Dash (commonly used by ChatGPT)', example: 'word—word', replacementType: 'keep' },
  '\u2018': { code: 'U+2018', name: 'Left Single Quote', visible: true, description: 'Left Single Quote', example: '‘word’', replacementType: 'keep' },
  '\u2019': { code: 'U+2019', name: 'Right Single Quote', visible: true, description: 'Right Single Quote', example: '‘word’', replacementType: 'keep' },
  '\u201C': { code: 'U+201C', name: 'Left Double Quote', visible: true, description: 'Left Double Quote', example: '“word”', replacementType: 'keep' },
  '\u201D': { code: 'U+201D', name: 'Right Double Quote', visible: true, description: 'Right Double Quote', example: '“word”', replacementType: 'keep' },
};

export function InvisibleTextDetector() {
  const [inputText, setInputText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [selectedChars, setSelectedChars] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);

  const detectedChars = useMemo(() => {
    if (!inputText) return [];

    const charMap = new Map<string, number>();
    for (const char of inputText) {
      if (UNICODE_CHARS[char]) {
        charMap.set(char, (charMap.get(char) || 0) + 1);
      } else {
        const code = char.charCodeAt(0);
        // Detect other non-standard or control characters
        if ((code < 32 && code !== 10 && code !== 13 && code !== 9) || (code >= 127 && code <= 159)) {
          charMap.set(char, (charMap.get(char) || 0) + 1);
        }
      }
    }

    return Array.from(charMap.entries()).map(([char, count]) => {
      const info = UNICODE_CHARS[char] || {
        code: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        name: 'Control/Unknown Character',
        visible: false,
        description: 'Potentially problematic control character',
        example: '',
        replacementType: 'remove',
      };
      return { ...info, count };
    }).sort((a, b) => (a.visible === b.visible ? 0 : a.visible ? 1 : -1));
  }, [inputText]);

  const handleClean = (charsToRemove?: Set<string>) => {
    const targets = charsToRemove || selectedChars;
    let result = inputText;

    for (const charCode of targets) {
      // Find the character key from its code (e.g., 'U+200B')
      const charKey = Object.keys(UNICODE_CHARS).find(key => UNICODE_CHARS[key].code === charCode) 
                    || String.fromCharCode(parseInt(charCode.replace('U+', ''), 16));
      
      const info = UNICODE_CHARS[charKey] || { replacementType: 'remove' };
      const regex = new RegExp(charKey, 'g');

      if (info.replacementType === 'remove') {
        result = result.replace(regex, '');
      } else if (info.replacementType === 'space') {
        result = result.replace(regex, ' ');
      } else if (info.replacementType === 'replace') {
        result = result.replace(regex, info.replacementValue || '');
      }
    }

    setCleanedText(result);
  };

  const handleRemoveAll = () => {
    const allCodes = new Set(detectedChars.map(c => c.code));
    handleClean(allCodes);
  };

  const handleRemoveInvisibleOnly = () => {
    const invisibleCodes = new Set(detectedChars.filter(c => !c.visible).map(c => c.code));
    handleClean(invisibleCodes);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleCharSelection = (code: string) => {
    const newSelection = new Set(selectedChars);
    if (newSelection.has(code)) {
      newSelection.delete(code);
    } else {
      newSelection.add(code);
    }
    setSelectedChars(newSelection);
  };

  const totalInvisibleCount = detectedChars.filter(c => !c.visible).reduce((sum, c) => sum + c.count, 0);
  const totalVisibleCount = detectedChars.filter(c => c.visible).reduce((sum, c) => sum + c.count, 0);

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Forensic Entropy Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute browser-local linguistic scans to identify hidden Unicode anomalies and LLM-injected artifacts.</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <Terminal className="h-3 w-3 text-primary" />
                                Source Payload
                            </Label>
                            <div className="space-y-4">
                                <Textarea
                                    id="input-text"
                                    value={inputText}
                                    onChange={(e) => {
                                        setInputText(e.target.value);
                                        setCleanedText('');
                                        setSelectedChars(new Set());
                                    }}
                                    rows={12}
                                    placeholder="Paste your source text or markdown logic..."
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[300px]"
                                />
                                
                                {inputText && (
                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                                        <div className="p-3 rounded-xl border bg-background flex flex-col items-center text-center">
                                            <span className="text-lg font-black tracking-tighter text-foreground">{inputText.length}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Input Size</span>
                                        </div>
                                        <div className="p-3 rounded-xl border bg-background flex flex-col items-center text-center">
                                            <span className="text-lg font-black tracking-tighter text-primary">{detectedChars.length}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Anomalies</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <Zap className="h-3 w-3 text-primary" />
                                Processing HUD
                            </Label>
                            
                            <div className="grid gap-3">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={detectedChars.length === 0}
                                    onClick={handleRemoveAll}
                                    className="h-10 font-bold text-[10px] uppercase tracking-widest rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Purge All Nodes
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={totalInvisibleCount === 0}
                                    onClick={handleRemoveInvisibleOnly}
                                    className="h-10 font-bold text-[10px] uppercase tracking-widest rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                >
                                    <EyeOff className="h-3.5 w-3.5 mr-2" />
                                    Mask Invisible Only
                                </Button>
                                <Button 
                                    onClick={() => handleClean()} 
                                    disabled={selectedChars.size === 0}
                                    className="h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Process Selection ({selectedChars.size})
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Forensic scans are executed locally. Source context never transits through network nodes.
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>

        {/* Results Canvas (Right) */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
            {/* Subtle Canvas Background */}
            <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                {detectedChars.length > 0 ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Anomaly Mapping Manifest</h3>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="destructive" className="h-5 text-[9px] font-bold border-none">
                                    {totalInvisibleCount} Invisible
                                </Badge>
                                <Badge variant="secondary" className="h-5 text-[9px] font-bold border-none bg-primary/10 text-primary">
                                    {totalVisibleCount} Special
                                </Badge>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-8 md:p-10 shadow-2xl relative group">
                            <div className="space-y-4 pb-20">
                                {detectedChars.map((char) => (
                                    <div 
                                        key={char.code} 
                                        className={cn(
                                            "group relative flex flex-col p-5 rounded-2xl border transition-all duration-500 shadow-sm",
                                            !char.visible ? "bg-destructive/[0.02] border-destructive/20 hover:border-destructive/40" : "bg-background border-border/40 hover:border-primary/40"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={selectedChars.has(char.code)}
                                                onCheckedChange={() => toggleCharSelection(char.code)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-black text-xs text-primary">{char.code}</span>
                                                        <Badge variant={char.visible ? 'secondary' : 'destructive'} className="h-4 text-[7px] uppercase font-black px-1.5 rounded-sm border-none">
                                                            {char.visible ? 'Visible' : 'Invisible'} Node
                                                        </Badge>
                                                    </div>
                                                    <Badge variant="outline" className="h-4 text-[8px] font-bold uppercase tracking-widest border-border/60">
                                                        Count: {char.count}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold tracking-tight">{char.name}</h4>
                                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">{char.description}</p>
                                                </div>

                                                {char.example && (
                                                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Syntax Sample:</span>
                                                        <code className="text-[10px] font-mono bg-muted/30 px-2 py-0.5 rounded-md text-primary/80">{char.example}</code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Forensic Engine</span>
                                <span>ENTROPY VERIFIED</span>
                            </div>
                        </ScrollArea>
                    </div>
                ) : inputText ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syntactic Integrity Manifest</h3>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 rounded-[40px] border-2 border-dashed border-green-500/20 bg-green-500/[0.02]">
                            <CheckCircle2 className="h-12 w-12 text-green-500/40 mb-4" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-green-600 mb-2">Integrity Optimal</h3>
                            <p className="text-xs text-muted-foreground italic max-w-xs leading-relaxed">No problematic Unicode anomalies or synthetic entropy detected in source payload.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Fingerprint className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Forensic Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Load source context on the left to begin structural entropy verification.</p>
                        </div>
                    </div>
                )}

                {cleanedText && (
                    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sanitized Output Manifest</h4>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCopy}
                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all"
                            >
                                {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                Copy Schema
                            </Button>
                        </div>
                        <div className="rounded-[32px] border bg-[#0d1117] p-8 shadow-2xl relative overflow-hidden">
                            <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30 min-h-[200px]" dir="ltr">
                                {cleanedText}
                            </pre>
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-60" />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Badge variant="outline" className="h-5 text-[8px] uppercase font-bold border-border/60">Final: {cleanedText.length} Chars</Badge>
                            <Badge variant="outline" className="h-5 text-[8px] uppercase font-bold border-border/60">Purged: {inputText.length - cleanedText.length} Anomalies</Badge>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

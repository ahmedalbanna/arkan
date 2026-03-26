'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Copy, Eye, EyeOff, Info, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

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
  positions: number[];
}

// Complete list of invisible and problematic Unicode characters
const UNICODE_CHARS: Record<string, Omit<UnicodeCharacter, 'count' | 'positions'>> = {
  // Regular characters (kept as-is)
  '\u0020': { code: 'U+0020', name: 'Regular Space', visible: true, description: 'Regular Space', example: 'word word', replacementType: 'keep' },
  '\u000A': { code: 'U+000A', name: 'Line Feed (LF)', visible: true, description: 'Line Feed (LF)', example: 'line1\nline2', replacementType: 'keep' },

  // Space replacements
  '\u00A0': { code: 'U+00A0', name: 'No-Break Space', visible: true, description: 'No-Break Space', example: 'word word', replacementType: 'space' },
  '\u0009': { code: 'U+0009', name: 'Tab', visible: true, description: 'Tab', example: 'word → word', replacementType: 'replace', replacementValue: '    ' },
  '\u2000': { code: 'U+2000', name: 'En Quad', visible: true, description: 'En Quad', example: 'word word', replacementType: 'space' },
  '\u2001': { code: 'U+2001', name: 'Em Quad', visible: true, description: 'Em Quad', example: 'word word', replacementType: 'space' },
  '\u2002': { code: 'U+2002', name: 'En Space', visible: true, description: 'En Space', example: 'word word', replacementType: 'space' },
  '\u2003': { code: 'U+2003', name: 'Em Space', visible: true, description: 'Em Space', example: 'word word', replacementType: 'space' },
  '\u2004': { code: 'U+2004', name: 'Three-Per-Em Space', visible: true, description: 'Three-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2005': { code: 'U+2005', name: 'Four-Per-Em Space', visible: true, description: 'Four-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2006': { code: 'U+2006', name: 'Six-Per-Em Space', visible: true, description: 'Six-Per-Em Space', example: 'word word', replacementType: 'space' },
  '\u2007': { code: 'U+2007', name: 'Figure Space', visible: true, description: 'Figure Space', example: 'word word', replacementType: 'space' },
  '\u2008': { code: 'U+2008', name: 'Punctuation Space', visible: true, description: 'Punctuation Space', example: 'word word', replacementType: 'space' },
  '\u2009': { code: 'U+2009', name: 'Thin Space', visible: true, description: 'Thin Space', example: 'word word', replacementType: 'space' },
  '\u200A': { code: 'U+200A', name: 'Hair Space', visible: true, description: 'Hair Space', example: 'word word', replacementType: 'space' },
  '\u202F': { code: 'U+202F', name: 'Narrow NBSP', visible: true, description: 'Narrow NBSP', example: 'word word', replacementType: 'space' },
  '\u205F': { code: 'U+205F', name: 'Math Space', visible: true, description: 'Math Space', example: 'word word', replacementType: 'space' },
  '\u3000': { code: 'U+3000', name: 'Ideographic Space', visible: true, description: 'Ideographic Space', example: 'word word', replacementType: 'space' },
  '\u1680': { code: 'U+1680', name: 'Ogham Space Mark', visible: true, description: 'Ogham Space Mark', example: 'word word', replacementType: 'space' },
  '\u180E': { code: 'U+180E', name: 'Mongolian Vowel Sep.', visible: true, description: 'Mongolian Vowel Separator', example: 'word word', replacementType: 'space' },
  '\u2800': { code: 'U+2800', name: 'Braille Blank', visible: true, description: 'Braille Blank', example: 'word word', replacementType: 'space' },
  '\u3164': { code: 'U+3164', name: 'Hangul Filler', visible: true, description: 'Hangul Filler', example: 'word word', replacementType: 'space' },
  '\uFFA0': { code: 'U+FFA0', name: 'Half-width Hangul Filler', visible: true, description: 'Half-width Hangul Filler', example: 'word word', replacementType: 'space' },
  '\u200B': { code: 'U+200B', name: 'Zero-Width Space', visible: false, description: 'Zero-Width Space', example: 'word​word', replacementType: 'space' },

  // Invisible characters to remove
  '\u200C': { code: 'U+200C', name: 'Zero-Width Non-Joiner', visible: false, description: 'Zero-Width Non-Joiner', example: 'word‌word', replacementType: 'remove' },
  '\u200D': { code: 'U+200D', name: 'Zero-Width Joiner', visible: false, description: 'Zero-Width Joiner', example: 'word‍word', replacementType: 'remove' },
  '\u200E': { code: 'U+200E', name: 'Left-To-Right Mark', visible: false, description: 'Left-To-Right Mark', example: '', replacementType: 'remove' },
  '\u200F': { code: 'U+200F', name: 'Right-To-Left Mark', visible: false, description: 'Right-To-Left Mark', example: '', replacementType: 'remove' },
  '\u202A': { code: 'U+202A', name: 'LTR Embedding', visible: false, description: 'LTR Embedding', example: '', replacementType: 'remove' },
  '\u202B': { code: 'U+202B', name: 'RTL Embedding', visible: false, description: 'RTL Embedding', example: '', replacementType: 'remove' },
  '\u202C': { code: 'U+202C', name: 'Pop Directional Fmt', visible: false, description: 'Pop Directional Formatting', example: '', replacementType: 'remove' },
  '\u202D': { code: 'U+202D', name: 'LTR Override', visible: false, description: 'LTR Override', example: '', replacementType: 'remove' },
  '\u202E': { code: 'U+202E', name: 'RTL Override', visible: false, description: 'RTL Override', example: '', replacementType: 'remove' },
  '\u2060': { code: 'U+2060', name: 'Word Joiner', visible: false, description: 'Word Joiner', example: 'word⁠word', replacementType: 'remove' },
  '\u2061': { code: 'U+2061', name: 'Function Application', visible: false, description: 'Function Application', example: '', replacementType: 'remove' },
  '\u2066': { code: 'U+2066', name: 'LTR Isolate', visible: false, description: 'LTR Isolate', example: '', replacementType: 'remove' },
  '\u2067': { code: 'U+2067', name: 'RTL Isolate', visible: false, description: 'RTL Isolate', example: '', replacementType: 'remove' },
  '\u2068': { code: 'U+2068', name: 'First Strong Isolate', visible: false, description: 'First Strong Isolate', example: '', replacementType: 'remove' },
  '\u2069': { code: 'U+2069', name: 'Pop Directional Isolate', visible: false, description: 'Pop Directional Isolate', example: '', replacementType: 'remove' },
  '\u206A': { code: 'U+206A', name: 'Inhibit Symmetric Swap', visible: false, description: 'Inhibit Symmetric Swap', example: '', replacementType: 'remove' },
  '\u206B': { code: 'U+206B', name: 'Activate Symmetric Swap', visible: false, description: 'Activate Symmetric Swap', example: '', replacementType: 'remove' },
  '\u206C': { code: 'U+206C', name: 'Inhibit Arabic Form Shaping', visible: false, description: 'Inhibit Arabic Form Shaping', example: '', replacementType: 'remove' },
  '\u206D': { code: 'U+206D', name: 'Activate Arabic Form Shaping', visible: false, description: 'Activate Arabic Form Shaping', example: '', replacementType: 'remove' },
  '\u206E': { code: 'U+206E', name: 'National Digit Shapes', visible: false, description: 'National Digit Shapes', example: '', replacementType: 'remove' },
  '\u206F': { code: 'U+206F', name: 'Nominal Digit Shapes', visible: false, description: 'Nominal Digit Shapes', example: '', replacementType: 'remove' },
  '\u00AD': { code: 'U+00AD', name: 'Soft Hyphen', visible: false, description: 'Soft Hyphen', example: 'word­word', replacementType: 'remove' },
  '\u034F': { code: 'U+034F', name: 'Grapheme Joiner', visible: false, description: 'Grapheme Joiner', example: '', replacementType: 'remove' },
  '\u001C': { code: 'U+001C', name: 'File Separator', visible: true, description: 'File Separator', example: '', replacementType: 'remove' },
  '\u000D': { code: 'U+000D', name: 'Carriage Return (CR)', visible: true, description: 'Carriage Return (CR)', example: '', replacementType: 'remove' },
  '\u115F': { code: 'U+115F', name: 'Hangul Choseong Filler', visible: true, description: 'Hangul Choseong Filler', example: '', replacementType: 'remove' },
  '\u1160': { code: 'U+1160', name: 'Hangul Jungseong Filler', visible: true, description: 'Hangul Jungseong Filler', example: '', replacementType: 'remove' },
  '\u17B4': { code: 'U+17B4', name: 'Khmer Vowel Inherent AQ', visible: true, description: 'Khmer Vowel Inherent AQ', example: '', replacementType: 'remove' },
  '\u17B5': { code: 'U+17B5', name: 'Khmer Vowel Inherent AA', visible: true, description: 'Khmer Vowel Inherent AA', example: '', replacementType: 'remove' },
  '\u180B': { code: 'U+180B', name: 'Mongolian VS-1', visible: false, description: 'Mongolian VS-1', example: '', replacementType: 'remove' },
  '\u180C': { code: 'U+180C', name: 'Mongolian VS-2', visible: false, description: 'Mongolian VS-2', example: '', replacementType: 'remove' },
  '\u180D': { code: 'U+180D', name: 'Mongolian VS-3', visible: false, description: 'Mongolian VS-3', example: '', replacementType: 'remove' },
  '\uFE00': { code: 'U+FE00', name: 'Variation Selector-1', visible: false, description: 'Variation Selector-1', example: '', replacementType: 'remove' },
  '\uFE01': { code: 'U+FE01', name: 'Variation Selector-2', visible: false, description: 'Variation Selector-2', example: '', replacementType: 'remove' },
  '\uFE02': { code: 'U+FE02', name: 'Variation Selector-3', visible: false, description: 'Variation Selector-3', example: '', replacementType: 'remove' },
  '\uFE03': { code: 'U+FE03', name: 'Variation Selector-4', visible: false, description: 'Variation Selector-4', example: '', replacementType: 'remove' },
  '\uFE04': { code: 'U+FE04', name: 'Variation Selector-5', visible: false, description: 'Variation Selector-5', example: '', replacementType: 'remove' },
  '\uFE05': { code: 'U+FE05', name: 'Variation Selector-6', visible: false, description: 'Variation Selector-6', example: '', replacementType: 'remove' },
  '\uFE06': { code: 'U+FE06', name: 'Variation Selector-7', visible: false, description: 'Variation Selector-7', example: '', replacementType: 'remove' },
  '\uFE07': { code: 'U+FE07', name: 'Variation Selector-8', visible: false, description: 'Variation Selector-8', example: '', replacementType: 'remove' },
  '\uFE08': { code: 'U+FE08', name: 'Variation Selector-9', visible: false, description: 'Variation Selector-9', example: '', replacementType: 'remove' },
  '\uFE09': { code: 'U+FE09', name: 'Variation Selector-10', visible: false, description: 'Variation Selector-10', example: '', replacementType: 'remove' },
  '\uFE0A': { code: 'U+FE0A', name: 'Variation Selector-11', visible: false, description: 'Variation Selector-11', example: '', replacementType: 'remove' },
  '\uFE0B': { code: 'U+FE0B', name: 'Variation Selector-12', visible: false, description: 'Variation Selector-12', example: '', replacementType: 'remove' },
  '\uFE0C': { code: 'U+FE0C', name: 'Variation Selector-13', visible: false, description: 'Variation Selector-13', example: '', replacementType: 'remove' },
  '\uFE0D': { code: 'U+FE0D', name: 'Variation Selector-14', visible: false, description: 'Variation Selector-14', example: '', replacementType: 'remove' },
  '\uFE0E': { code: 'U+FE0E', name: 'Variation Selector-15', visible: false, description: 'Variation Selector-15', example: '', replacementType: 'remove' },
  '\uFE0F': { code: 'U+FE0F', name: 'Variation Selector-16', visible: false, description: 'Variation Selector-16', example: '', replacementType: 'remove' },
  '\uFEFF': { code: 'U+FEFF', name: 'Zero-Width NBSP / BOM', visible: false, description: 'Zero-Width NBSP / BOM', example: '​', replacementType: 'remove' },

  // Special replacements
  '\u2062': { code: 'U+2062', name: 'Invisible Times', visible: false, description: 'Invisible Times', example: '', replacementType: 'replace', replacementValue: 'x' },
  '\u2063': { code: 'U+2063', name: 'Invisible Separator', visible: false, description: 'Invisible Separator', example: '', replacementType: 'replace', replacementValue: ',' },
  '\u2064': { code: 'U+2064', name: 'Invisible Plus', visible: false, description: 'Invisible Plus', example: '', replacementType: 'replace', replacementValue: '+' },
  '\u2028': { code: 'U+2028', name: 'Line Separator', visible: false, description: 'Line Separator', example: '', replacementType: 'replace', replacementValue: '\n' },
  '\u2029': { code: 'U+2029', name: 'Paragraph Separator', visible: false, description: 'Paragraph Separator', example: '', replacementType: 'replace', replacementValue: '\n\n' },
  '\uFFFC': { code: 'U+FFFC', name: 'Object Replacement', visible: true, description: 'Object Replacement', example: '', replacementType: 'replace', replacementValue: '[OBJECT]' },

  // Keep as-is (visible formatting characters)
  '\u2014': { code: 'U+2014', name: 'Em Dash', visible: true, description: 'Em Dash (commonly used by ChatGPT)', example: 'word—word', replacementType: 'keep' },
  '\u2013': { code: 'U+2013', name: 'En Dash', visible: true, description: 'En Dash', example: 'pages 1–10', replacementType: 'keep' },
  '\u2019': { code: 'U+2019', name: 'Right Single Quote', visible: true, description: 'Right Single Quote', example: "don't", replacementType: 'keep' },
  '\u201C': { code: 'U+201C', name: 'Left Double Quote', visible: true, description: 'Left Double Quote', example: '"hello', replacementType: 'keep' },
  '\u201D': { code: 'U+201D', name: 'Right Double Quote', visible: true, description: 'Right Double Quote', example: 'hello"', replacementType: 'keep' },
  '\u2018': { code: 'U+2018', name: 'Left Single Quote', visible: true, description: 'Left Single Quote', example: "'hello", replacementType: 'keep' },
  '\u2026': { code: 'U+2026', name: 'Horizontal Ellipsis', visible: true, description: 'Horizontal Ellipsis', example: 'wait…', replacementType: 'keep' },
  '\u000C': { code: 'U+000C', name: 'Form Feed', visible: true, description: 'Form Feed', example: '', replacementType: 'keep' },
};

export function InvisibleTextDetector() {
  const [inputText, setInputText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [selectedChars, setSelectedChars] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);

  // Detect all Unicode characters in the text
  const detectedChars = useMemo(() => {
    if (!inputText) return [];

    const charMap = new Map<string, UnicodeCharacter>();

    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      const charInfo = UNICODE_CHARS[char];

      if (charInfo) {
        if (!charMap.has(char)) {
          charMap.set(char, {
            ...charInfo,
            count: 0,
            positions: [],
          });
        }
        const existing = charMap.get(char)!;
        existing.count++;
        existing.positions.push(i);
      }
    }

    return Array.from(charMap.values()).sort((a, b) => b.count - a.count);
  }, [inputText]);

  // Clean text based on selected characters
  const handleClean = (charsToRemove?: Set<string>) => {
    if (!inputText) return;

    const charsToClean = charsToRemove ?? selectedChars;
    let cleaned = inputText;

    const charsToProcess = charsToClean.size === 0
      ? detectedChars.map(c => c.code)
      : Array.from(charsToClean);

    charsToProcess.forEach(code => {
      const charInfo = detectedChars.find(c => c.code === code);
      if (!charInfo) return;

      const unicodeChar = Object.keys(UNICODE_CHARS).find(
        key => UNICODE_CHARS[key].code === code
      );
      if (!unicodeChar) return;

      const replacementInfo = UNICODE_CHARS[unicodeChar];
      let replacement = '';

      switch (replacementInfo.replacementType) {
        case 'remove':
          replacement = '';
          break;
        case 'space':
          replacement = ' ';
          break;
        case 'replace':
          replacement = replacementInfo.replacementValue || '';
          break;
        case 'keep':
          // Don't replace, keep as-is
          return;
        default:
          replacement = '';
      }

      cleaned = cleaned.replaceAll(unicodeChar, replacement);
    });

    setCleanedText(cleaned);
  };

  const handleRemoveAll = () => {
    // Exclude characters marked as 'keep' from removal
    const allCodes = new Set(
      detectedChars
        .filter(c => c.replacementType !== 'keep')
        .map(c => c.code)
    );
    setSelectedChars(allCodes);
    handleClean(allCodes);
  };

  const handleRemoveInvisibleOnly = () => {
    // Only include invisible characters that are not marked as 'keep'
    const invisibleCodes = new Set(
      detectedChars
        .filter(c => !c.visible && c.replacementType !== 'keep')
        .map(c => c.code)
    );
    setSelectedChars(invisibleCodes);
    handleClean(invisibleCodes);
  };

  const handleCopy = async () => {
    if (cleanedText) {
      await navigator.clipboard.writeText(cleanedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleCharSelection = (code: string) => {
    const newSelected = new Set(selectedChars);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedChars(newSelected);
  };

  const totalInvisibleCount = detectedChars.filter(c => !c.visible).reduce((sum, c) => sum + c.count, 0);
  const totalVisibleCount = detectedChars.filter(c => c.visible).reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Assured:</strong> All processing happens locally in your browser; your text never leaves your device.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
          <CardDescription>Paste your text here to detect invisible Unicode characters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-text">Your Text</Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setCleanedText('');
                  setSelectedChars(new Set());
                }}
                rows={8}
                placeholder="Paste your text here..."
                className="font-mono text-sm"
              />
            </div>
            {inputText && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">
                  Total Characters: {inputText.length}
                </Badge>
                {detectedChars.length > 0 && (
                  <>
                    <Badge variant="destructive">
                      Invisible: {totalInvisibleCount}
                    </Badge>
                    <Badge variant="secondary">
                      Special Visible: {totalVisibleCount}
                    </Badge>
                    <Badge variant="outline">
                      Unique Types: {detectedChars.length}
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {detectedChars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detected Characters ({detectedChars.length})
            </CardTitle>
            <CardDescription>
              Select specific characters to process (remove, replace with space, or replace with specific character), or use the quick actions below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove All Detected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveInvisibleOnly}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Remove Invisible Only
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleClean()}
                  disabled={selectedChars.size === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Process Selected ({selectedChars.size})
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-3">
                  {detectedChars.map((char) => (
                    <div
                      key={char.code}
                      className={`p-3 border rounded-lg ${!char.visible ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/50'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedChars.has(char.code)}
                          onCheckedChange={() => toggleCharSelection(char.code)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-sm">{char.code}</span>
                            <Badge variant={char.visible ? 'secondary' : 'destructive'}>
                              {char.visible ? 'Visible' : 'Invisible'}
                            </Badge>
                            <Badge variant="outline">
                              Count: {char.count}
                            </Badge>
                            <Badge
                              variant={
                                char.replacementType === 'remove' ? 'destructive' :
                                  char.replacementType === 'space' ? 'default' :
                                    char.replacementType === 'replace' ? 'secondary' :
                                      'outline'
                              }
                            >
                              {char.replacementType === 'remove' && '→ Remove'}
                              {char.replacementType === 'space' && '→ Space'}
                              {char.replacementType === 'replace' && `→ "${char.replacementValue || ''}"`}
                              {char.replacementType === 'keep' && '→ Keep'}
                            </Badge>
                          </div>
                          <div className="font-semibold">{char.name}</div>
                          <div className="text-sm text-muted-foreground">{char.description}</div>
                          {char.example && (
                            <div className="text-xs font-mono bg-background p-2 rounded border mt-2">
                              Example: {char.example}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {detectedChars.length === 0 && inputText && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold">No problematic Unicode characters detected!</p>
              <p className="text-sm mt-2">Your text appears to be clean.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {cleanedText && (
        <Card>
          <CardHeader>
            <CardTitle>Cleaned Text</CardTitle>
            <CardDescription>Your text with selected characters processed (removed, replaced with space, or replaced with specific characters)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Result</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={cleanedText}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">
                  Original: {inputText.length} chars
                </Badge>
                <Badge variant="outline">
                  Cleaned: {cleanedText.length} chars
                </Badge>
                <Badge variant="outline">
                  Removed: {inputText.length - cleanedText.length} chars
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Removing invisible characters does not bypass AI detection. AI-generated content will still be identified as AI-generated by detection tools.
        </AlertDescription>
      </Alert>
    </div>
  );
}


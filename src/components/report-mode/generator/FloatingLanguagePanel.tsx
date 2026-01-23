'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages as LanguageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Language, Tone } from '@/lib/models';
import { ToneSchema } from '@/lib/models';

interface FloatingLanguagePanelProps {
  language: Language;
  tone: Tone;
  onLanguageChange: (value: Language) => void;
  onToneChange: (value: Tone) => void;
}

/**
 * FloatingLanguagePanel Component
 * 
 * Displays language and tone selection in a floating panel.
 */
export function FloatingLanguagePanel({
  language,
  tone,
  onLanguageChange,
  onToneChange,
}: FloatingLanguagePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-64 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider uppercase">Language</Label>
              <Select value={language ?? 'default'} onValueChange={onLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider uppercase">Tone</Label>
              <Select value={tone ?? 'professional'} onValueChange={onToneChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ToneSchema.options.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={() => setIsOpen(prev => !prev)}
              aria-label="Toggle language settings"
            >
              <LanguageIcon className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Language & Tone</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

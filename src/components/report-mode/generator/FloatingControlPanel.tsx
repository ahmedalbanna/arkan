'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FloatingControlPanelProps {
  complexity: number;
  formality: number;
  onComplexityChange: (value: number) => void;
  onFormalityChange: (value: number) => void;
}

/**
 * FloatingControlPanel Component
 *
 * Displays complexity and formality controls in a floating panel.
 */
export function FloatingControlPanel({
  complexity,
  formality,
  onComplexityChange,
  onFormalityChange,
}: FloatingControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-64 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold tracking-wider uppercase">Formality</Label>
                <Badge variant="secondary">{formality ?? 70}%</Badge>
              </div>
              <Slider
                value={[formality ?? 70]}
                onValueChange={(val) => onFormalityChange(val[0])}
                min={0}
                max={100}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold tracking-wider uppercase">Complexity</Label>
                <Badge variant="secondary">{complexity ?? 50}%</Badge>
              </div>
              <Slider
                value={[complexity ?? 50]}
                onValueChange={(val) => onComplexityChange(val[0])}
                min={0}
                max={100}
                step={10}
              />
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
              aria-label="Toggle global controls"
            >
              <SlidersHorizontal className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Complexity & Formality</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

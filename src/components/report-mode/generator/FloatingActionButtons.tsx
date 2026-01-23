'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ZoomOut, ZoomIn } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingActionButtonsProps {
  onChatToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/**
 * FloatingActionButtons Component
 * 
 * Displays chat and zoom action buttons.
 */
export function FloatingActionButtons({
  onChatToggle,
  onZoomIn,
  onZoomOut,
}: FloatingActionButtonsProps) {
  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={onChatToggle}
              aria-label="Toggle AI Chat"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>AI Project Consultant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-10 w-10 shadow"
              onClick={onZoomOut}
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-10 w-10 shadow"
              onClick={onZoomIn}
              aria-label="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

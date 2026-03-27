'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';

interface FlipperProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  className?: string;
}

export const Flipper = ({ front, back, isFlipped, className }: FlipperProps) => {
  return (
    <div className={cn('relative w-full h-full group/flipper', className)} style={{ perspective: '1200px' }}>
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
          '[transform-style:preserve-3d]'
        )}
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of the card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
          {front}
        </div>

        {/* Back of the card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
};

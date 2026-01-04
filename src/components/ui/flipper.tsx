'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface FlipperProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  className?: string;
}

export const Flipper = ({ front, back, isFlipped, className }: FlipperProps) => {
  return (
    <div className={cn('relative w-full h-full', className)} style={{ perspective: '1000px' }}>
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-700',
          '[transform-style:preserve-3d]'
        )}
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of the card */}
        <div className="fixed w-full h-full [backface-visibility:hidden]">
          {front}
        </div>

        {/* Back of the card */}
        <div className="fixed w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
};

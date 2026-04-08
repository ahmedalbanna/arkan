'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';

interface AtmosphericGridProps {
  /**
   * Opacity of the grid lines.
   * @default 0.02
   */
  opacity?: number;
  /**
   * Size of the grid cells in pixels.
   * @default 28
   */
  size?: number;
  className?: string;
}

/**
 * AtmosphericGrid — A reusable background component that renders a technical dot-grid pattern.
 * Standardizes the 28px workspace alignment across the builder suite.
 */
export const AtmosphericGrid: React.FC<AtmosphericGridProps> = ({
  opacity = 0.02,
  size = 28,
  className,
}) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none transition-opacity duration-1000',
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`,
        opacity: opacity,
      }}
      aria-hidden="true"
    />
  );
};

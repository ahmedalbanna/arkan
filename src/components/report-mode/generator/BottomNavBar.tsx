'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { BookOpenText, Settings } from 'lucide-react';

interface BottomNavBarProps {
  activeView: 'generator' | 'result';
  onViewChange: (view: 'generator' | 'result') => void;
}

/**
 * BottomNavBar Component
 *
 * Mobile-only bottom navigation for switching between generator and result views.
 */
export function BottomNavBar({ activeView, onViewChange }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t p-2 flex items-center justify-around z-50 lg:hidden">
      <Button
        variant={activeView === 'generator' ? 'secondary' : 'ghost'}
        className={cn(
          'flex flex-col items-center h-full w-full',
          activeView === 'generator' && 'text-primary'
        )}
        onClick={() => onViewChange('generator')}
      >
        <Settings className="h-5 w-5 mb-1" />
        <span className="text-xs">Setup</span>
      </Button>
      <Button
        variant={activeView === 'result' ? 'secondary' : 'ghost'}
        className={cn(
          'flex flex-col items-center h-full w-full',
          activeView === 'result' && 'text-primary'
        )}
        onClick={() => onViewChange('result')}
      >
        <BookOpenText className="h-5 w-5 mb-1" />
        <span className="text-xs">Document</span>
      </Button>
    </div>
  );
}

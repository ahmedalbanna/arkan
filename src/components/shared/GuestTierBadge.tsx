
'use client';

import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

interface GuestTierBadgeProps {
  className?: string;
}

export function GuestTierBadge({ className }: GuestTierBadgeProps) {
  const { isGuest } = useAuth();

  if (!isGuest) return null;

  return (
    <div className={cn("flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-500", className)}>
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-6 px-3 flex items-center gap-2 rounded-full shadow-sm">
        <div className="relative">
            <Zap className="h-3 w-3 fill-primary text-primary" />
            <div className="absolute inset-0 h-3 w-3 animate-ping bg-primary/40 rounded-full" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Guest Tier</span>
      </Badge>
      
      <div className="hidden md:flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-muted/30 border border-dashed border-border/60">
        <ShieldCheck className="h-2.5 w-2.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">5 Free Daily</span>
      </div>
    </div>
  );
}

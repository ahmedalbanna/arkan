
'use client';

import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

interface GuestTierBadgeProps {
  className?: string;
}

export function GuestTierBadge({ className }: GuestTierBadgeProps) {
  const { isGuest, usage, userProfile } = useAuth();

  const isFreeRegistered = !isGuest && userProfile && (userProfile.credits === 0 || !userProfile.credits);
  const showBadge = isGuest || isFreeRegistered;

  if (!showBadge) return null;

  const remaining = usage?.remainingFreeGenerations ?? (isGuest ? 5 : 10);
  const total = usage?.totalLimit ?? (isGuest ? 5 : 10);
  const percentage = (remaining / total) * 100;

  const statusColor = percentage === 0 
    ? "text-destructive border-destructive/20 bg-destructive/5" 
    : percentage <= 40 
        ? "text-orange-500 border-orange-500/20 bg-orange-500/5" 
        : "text-primary border-primary/20 bg-primary/5";

  return (
    <div className={cn("flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-500", className)}>
      <Badge variant="outline" className={cn("h-6 px-3 flex items-center gap-2 rounded-full shadow-sm transition-colors duration-500", statusColor)}>
        <div className="relative">
            <Zap className={cn("h-3 w-3 fill-current", percentage === 0 ? "animate-pulse" : "")} />
            {percentage > 0 && <div className="absolute inset-0 h-3 w-3 animate-ping bg-current opacity-20 rounded-full" />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
            {isGuest ? 'Guest Tier' : 'Free Tier'}
        </span>
      </Badge>
      
      <div className="hidden md:flex items-center gap-1.5 px-3 h-6 rounded-full bg-muted/30 border border-dashed border-border/60">
        <ShieldCheck className="h-2.5 w-2.5 text-muted-foreground/60" />
        <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            percentage === 0 ? "text-destructive" : "text-muted-foreground/80"
        )}>
            {remaining} / {total} REMAINING
        </span>
      </div>
    </div>
  );
}

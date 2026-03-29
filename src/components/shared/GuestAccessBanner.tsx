
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/infrastructure/utils/cn';

export function GuestAccessBanner() {
  const { isGuest } = useAuth();
  const { t } = useLocalization();

  if (!isGuest) return null;

  return (
    <div className="relative mb-10 overflow-hidden rounded-[24px] bg-primary/5 border border-primary/10 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Technical Decorations */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
              Guest Mode Active
            </Badge>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-bold font-headline tracking-tight">Experience Arkan Intelligence</h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            You are currently in <span className="text-primary font-bold">Guest Mode</span>. You have access to essential writing tools with a <span className="font-bold">5-generation daily limit</span>. 
            <span className="block mt-2 font-medium text-foreground/80 italic">Unlock the full power of Arkan AI by creating a free account.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-background/50 hover:bg-background transition-all">
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="h-3.5 w-3.5" />
              {t('login.pageTitle')}
            </Link>
          </Button>
          <Button asChild size="sm" className="h-10 px-6 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 gap-2">
            <Link href="/signup" className="flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { User as UserIcon, LayoutDashboard, AreaChart, LogOut, BookOpenCheck, Loader2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

/**
 * UserProfileDropdown — Secure identity gateway for the mission control center.
 * 
 * DEFENSIVE MEASURES:
 * 1. Safe Initials: Guarded getInitials() call with generic glyph fallback.
 * 2. Mutation Pulse: Visual status indicators during the logout protocol.
 * 3. Type Integrity: Enforces strict User domain typing for all property access.
 * 4. UX Safety: Disables navigation vectors during active session termination.
 */

export function UserProfileDropdown() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();
  const logoutMutation = useLogout();

  // 1. EXISTENCE GUARD — Prevent rendering if profile node is offline
  if (!userProfile) return null;

  const isLoggingOut = logoutMutation.isPending;

  // 2. DATA INTEGRITY — Safe glyph extraction
  const getSafeInitials = () => {
    try {
        return typeof userProfile.getInitials === 'function' 
            ? userProfile.getInitials() 
            : userProfile.name?.charAt(0).toUpperCase() || 'ID';
    } catch (e) {
        return 'ID';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            disabled={isLoggingOut}
            className="h-9 w-9 rounded-lg p-0 hover:bg-primary/10 transition-all duration-300 relative group" 
            aria-label="Toggle user menu"
        >
          <Avatar className={cn(
              "h-8 w-8 rounded-md border shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500",
              isLoggingOut && "animate-pulse opacity-50 grayscale"
          )}>
            <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px] uppercase tracking-tighter">
                {getSafeInitials()}
            </AvatarFallback>
          </Avatar>
          {isLoggingOut && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
              </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl shadow-2xl border-border/40 p-1.5 bg-background/95 backdrop-blur-2xl">
        <div className="px-3 py-4 flex flex-col gap-3 relative overflow-hidden">
            {/* Atmospheric detail */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:20px_20px]" />
            
            <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-10 w-10 rounded-lg border shadow-sm ring-1 ring-primary/10">
                    <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black">{getSafeInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-black truncate tracking-tight leading-none mb-1.5 uppercase">{userProfile.name}</span>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <Badge variant="secondary" className="h-4 w-fit text-[8px] uppercase tracking-[0.2em] px-1.5 rounded-sm font-black border-none bg-primary/10 text-primary">
                            {userProfile.role} Node
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
        
        <DropdownMenuSeparator className="mx-1.5 bg-primary/5" />
        
        <div className="p-1 space-y-0.5">
            <DropdownMenuItem asChild disabled={isLoggingOut} className="rounded-xl gap-3 py-2.5 cursor-pointer focus:bg-primary/5">
                <Link href="/profile" className="flex items-center w-full">
                    <UserIcon className="h-4 w-4 text-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('header.profile') || 'Personal Matrix'}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled={isLoggingOut} className="rounded-xl gap-3 py-2.5 cursor-pointer focus:bg-primary/5">
                <Link href="/dashboard" className="flex items-center w-full">
                    <AreaChart className="h-4 w-4 text-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('header.myDashboard') || 'Neural Analytics'}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled={isLoggingOut} className="rounded-xl gap-3 py-2.5 cursor-pointer focus:bg-primary/5">
                <Link href="/docs" className="flex items-center w-full">
                    <BookOpenCheck className="h-4 w-4 text-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('header.documentation') || 'Intel Library'}</span>
                </Link>
            </DropdownMenuItem>
            
            {userProfile?.role === 'admin' && (
                <DropdownMenuItem asChild disabled={isLoggingOut} className="rounded-xl gap-3 py-2.5 cursor-pointer bg-primary/5 text-primary focus:bg-primary/10 focus:text-primary mt-1">
                    <Link href="/admin/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('header.admin') || 'Mission Control'}</span>
                    </Link>
                </DropdownMenuItem>
            )}
        </div>

        <DropdownMenuSeparator className="mx-1.5 bg-primary/5" />
        
        <div className="p-1">
            <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()} 
                disabled={isLoggingOut}
                className="rounded-xl gap-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 transition-all group/logout"
            >
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 group-hover/logout:translate-x-0.5 transition-transform" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('header.logout') || 'Terminate Node'}</span>
            </DropdownMenuItem>
        </div>

        <footer className="px-3 py-2 mt-1 border-t border-primary/5 flex items-center justify-between opacity-30">
            <span className="text-[7px] font-black uppercase tracking-[0.3em]">Identity Hub</span>
            <ShieldCheck className="h-2.5 w-2.5" />
        </footer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

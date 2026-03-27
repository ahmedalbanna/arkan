
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
import { User, LayoutDashboard, AreaChart, LogOut, BookOpenCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function UserProfileDropdown() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();
  const logoutMutation = useLogout();

  if (!userProfile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg p-0 hover:bg-primary/10 transition-all duration-300" aria-label="Toggle user menu">
          <Avatar className="h-8 w-8 rounded-md border shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{userProfile.getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-2xl border-border/40 p-1">
        <div className="px-3 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg border shadow-sm">
                    <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{userProfile.getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate tracking-tight leading-none mb-1">{userProfile.name}</span>
                    <Badge variant="secondary" className="h-4 w-fit text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-primary/5 text-primary">
                        {userProfile.role} Account
                    </Badge>
                </div>
            </div>
        </div>
        
        <DropdownMenuSeparator className="mx-1" />
        
        <div className="p-1 space-y-0.5">
            <DropdownMenuItem asChild className="rounded-lg gap-3 py-2.5 cursor-pointer">
                <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 text-primary/60" />
                    <span className="text-xs font-semibold">{t('header.profile')}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg gap-3 py-2.5 cursor-pointer">
                <Link href="/dashboard" className="flex items-center w-full">
                    <AreaChart className="h-4 w-4 text-primary/60" />
                    <span className="text-xs font-semibold">{t('header.myDashboard')}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg gap-3 py-2.5 cursor-pointer">
                <Link href="/docs" className="flex items-center w-full">
                    <BookOpenCheck className="h-4 w-4 text-primary/60" />
                    <span className="text-xs font-semibold">{t('header.documentation')}</span>
                </Link>
            </DropdownMenuItem>
            
            {userProfile?.role === 'admin' && (
                <DropdownMenuItem asChild className="rounded-lg gap-3 py-2.5 cursor-pointer bg-primary/5 text-primary focus:bg-primary/10 focus:text-primary">
                    <Link href="/admin/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('header.admin')}</span>
                    </Link>
                </DropdownMenuItem>
            )}
        </div>

        <DropdownMenuSeparator className="mx-1" />
        
        <div className="p-1">
            <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()} 
                disabled={logoutMutation.isPending}
                className="rounded-lg gap-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
            >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('header.logout')}</span>
            </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

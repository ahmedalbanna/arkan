
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
import { useAuth } from '@/context/NextAuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { User, LayoutDashboard, AreaChart, LogOut, BookOpenCheck, Settings, CreditCard, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { signOut } from 'next-auth/react';

export function UserProfileDropdown() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const isAdmin = userProfile.role === 'admin';
  const isPremium = userProfile.isPremium || false;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full transition-all duration-200 hover:bg-accent relative",
            isAdmin && "ring-2 ring-purple-500/30"
          )}
          aria-label="Toggle user menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
            <AvatarFallback className="bg-primary/10 font-semibold">{userProfile.getInitials()}</AvatarFallback>
          </Avatar>
          {isPremium && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        <div className="px-2 py-2">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
              <AvatarFallback className="bg-primary/10 font-semibold text-sm">{userProfile.getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {isAdmin && (
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800">
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    Admin
                  </Badge>
                )}
                {isPremium && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="me-2 h-4 w-4" />
            <span>{t('header.profile')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/payment-history" className="cursor-pointer">
            <CreditCard className="me-2 h-4 w-4" />
            <span>{t('header.paymentHistory') || 'Payment History'}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <AreaChart className="me-2 h-4 w-4" />
            <span>{t('header.myDashboard')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/docs" className="cursor-pointer">
            <BookOpenCheck className="me-2 h-4 w-4" />
            <span>{t('header.documentation')}</span>
          </Link>
        </DropdownMenuItem>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <LayoutDashboard className="me-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-600 dark:text-purple-400">{t('header.admin')}</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Settings & Logout */}
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile?tab=settings" className="cursor-pointer">
            <Settings className="me-2 h-4 w-4" />
            <span>{t('header.settings') || 'Settings'}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="me-2 h-4 w-4" />
          <span>{t('header.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

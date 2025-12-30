
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
import { useLogout } from '@/hooks/auth/use-auth-mutations';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { User, LayoutDashboard, AreaChart, LogOut, BookOpenCheck } from 'lucide-react';

export function UserProfileDropdown() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();
  const logoutMutation = useLogout();

  if (!userProfile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Toggle user menu">
          <Avatar>
            <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.name} />
            <AvatarFallback>{userProfile.getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{userProfile.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="me-2 h-4 w-4" />
            {t('header.profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <AreaChart className="me-2 h-4 w-4" />
            {t('header.myDashboard')}
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
            <Link href="/docs" >
              <BookOpenCheck className="me-2 h-4 w-4" />
              {t('header.documentation')}
            </Link>
          </DropdownMenuItem>
        {userProfile?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">
              <LayoutDashboard className="me-2 h-4 w-4" />
              {t('header.admin')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
          <LogOut className="me-2 h-4 w-4" />
          {t('header.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

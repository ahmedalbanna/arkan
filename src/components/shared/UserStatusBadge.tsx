'use client';

import { User } from '@/lib/models';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserStatusBadgeProps {
  userProfile: User | null;
}

export function UserStatusBadge({ userProfile }: UserStatusBadgeProps) {
  if (!userProfile) return null;

  // Determine user status based on role and activity
  const isAdmin = userProfile.role === 'admin';
  const isPremium = userProfile.isPremium || false;

  // Determine status badge based on role
  let statusIcon = null;
  let statusLabel = '';
  let statusColor = 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800';

  if (isAdmin) {
    statusIcon = <Crown className="h-3 w-3" />;
    statusLabel = 'Admin';
    statusColor = 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800';
  } else if (isPremium) {
    statusIcon = <Star className="h-3 w-3" />;
    statusLabel = 'Premium';
    statusColor = 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800';
  } else if (userProfile.credits && userProfile.credits > 50) {
    statusIcon = <Zap className="h-3 w-3" />;
    statusLabel = 'Active';
    statusColor = 'bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-800';
  }

  const tooltipText = isAdmin 
    ? 'Administrator account'
    : isPremium 
    ? 'Premium member' 
    : userProfile.credits && userProfile.credits > 50
    ? `${userProfile.credits} credits available`
    : `${userProfile.credits || 0} credits`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs font-medium border cursor-help transition-colors',
              statusColor
            )}
          >
            {statusIcon}
            <span>{statusLabel}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

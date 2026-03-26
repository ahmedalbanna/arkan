'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, KeyRound, Lock, Unlock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { AdminApiClient } from '@/modules/admin/adapters/api-client/AdminApiClient';
import { toast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/infrastructure/api/query-keys';
import { useLocalization } from '@/context/LocalizationContext';
import { User } from '@/modules/users/domain/entities/User';
import { GiftCreditsDialog } from '@/modules/users/adapters/components/payments/GiftCreditsDialog';
import { AdminNotificationDialog } from './AdminNotificationDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSendPasswordReset } from '@/hooks';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';

interface UserTableRowProps { user: User; }

export function UserTableRow({ user }: UserTableRowProps) {
  const { t } = useLocalization();
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const sendPasswordResetMutation = useSendPasswordReset();

  const toggleLockdownMutation = useMutation({
    mutationFn: async ({ userId, isDisabled }: { userId: string, isDisabled: boolean }) => {
      const client = container.resolve(AdminApiClient);
      const result = await client.setUserDisabledStatus(userId, isDisabled);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.isDisabled ? 'User Locked' : 'User Restored', 
        description: `The user account has been ${variables.isDisabled ? 'disabled' : 'enabled'}.` 
      });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
    onError: (error: any) => {
      toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
    }
  });

  async function prefetchUser(userId: string) {
    if (!firebaseUser) return;
    await queryClient.prefetchQuery({
      queryKey: userKeys.profile(userId),
      queryFn: async () => {
        const client = container.resolve(UserApiClient);
        const result = await client.fetchUserById(userId);
        if (result.isFailure) throw result.error;
        return new User(result.getValue());
      },
      staleTime: 1000 * 60,
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{t(`roles.${user.role}`)}</Badge></TableCell>
      <TableCell>{user.credits}</TableCell>
      <TableCell>{user.getFormattedDate()}</TableCell>
      <TableCell className="text-right flex items-center justify-end gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => toggleLockdownMutation.mutate({ userId: user.id, isDisabled: !user.isDisabled })}
          disabled={toggleLockdownMutation.isPending}
          className={user.isDisabled ? "text-destructive" : "text-muted-foreground"}
          title={user.isDisabled ? "Restore User" : "Lockdown User"}
        >
          {toggleLockdownMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user.isDisabled ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </Button>
        <AdminNotificationDialog user={user} />
        <GiftCreditsDialog user={user} />
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><KeyRound className="h-4 w-4" /><span className="sr-only">Reset Password</span></Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Reset Password</AlertDialogTitle><AlertDialogDescription>An email will be sent to {user.email} with instructions to reset their password. Are you sure?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => sendPasswordResetMutation.mutate(user.id)}>Send Reset Email</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button asChild variant="ghost" size="icon" onMouseEnter={() => prefetchUser(user.id)} aria-label={`${t('manageUsers.editUserSr')} ${user.name}`}>
          <Link href={`/admin/manage-users/${user.id}/edit`}><Pencil className="h-4 w-4" /></Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

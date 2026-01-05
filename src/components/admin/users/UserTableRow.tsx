
'use client';

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, KeyRound } from "lucide-react";
import Link from 'next/link';
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/util/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { User } from '@/lib/models';
import { GiftCreditsDialog } from "../payments/GiftCreditsDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSendPasswordReset } from "@/hooks";

interface UserTableRowProps {
    user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
    const { t } = useLocalization();
    const queryClient = useQueryClient();
    const { firebaseUser, userProfile: adminProfile } = useAuth();
    const sendPasswordResetMutation = useSendPasswordReset();

    // The prefetchUser function has been removed as it was using an obsolete API call.
    // React Query's default stale-while-revalidate behavior handles caching efficiently.

    const handlePasswordReset = () => {
        sendPasswordResetMutation.mutate(user.id);
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {t(`roles.${user.role}`)}
                </Badge>
            </TableCell>
            <TableCell>{user.credits}</TableCell>
            <TableCell>{user.getFormattedDate()}</TableCell>
            <TableCell className="text-right">
                <GiftCreditsDialog user={user} />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <KeyRound className="h-4 w-4" />
                            <span className="sr-only">Reset Password</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset Password</AlertDialogTitle>
                            <AlertDialogDescription>
                                An email will be sent to {user.email} with instructions to reset their password. Are you sure?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePasswordReset}>
                                Send Reset Email
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button asChild variant="ghost" size="icon" aria-label={`${t('manageUsers.editUserSr')} ${user.name}`}>
                    <Link href={`/admin/manage-users/${user.id}/edit`}>
                       <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
}

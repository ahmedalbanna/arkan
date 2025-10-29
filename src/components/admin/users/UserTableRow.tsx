
'use client';

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, MessageSquare } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { fetchUserProfileApi } from "@/services/api/userService";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/util/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { User, type UserProperties } from '@/lib/models'; // Import User class and properties

interface UserTableRowProps {
    user: UserProperties; // Accept plain object
}

export function UserTableRow({ user: userProps }: UserTableRowProps) {
    const { t } = useLocalization();
    const queryClient = useQueryClient();
    const { firebaseUser, userProfile: adminProfile } = useAuth();
    const router = useRouter();

    // Instantiate the User class from the plain object prop
    const user = new User(userProps);
    
    // Prefetch user profile on hover for a smoother navigation experience
    const prefetchUser = async (userId: string) => {
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        await queryClient.prefetchQuery({
            queryKey: userKeys.profile(userId),
            queryFn: () => fetchUserProfileApi(userId, token),
            staleTime: 1000 * 60 * 1, // Prefetched data is fresh for 1 minute
        });
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
            <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'd MMM yyyy') : 'N/A'}</TableCell>
            <TableCell className="text-right">
               <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">{t('manageUsers.chatWithUserSr')}</span>
                </Button>
              <Button asChild variant="ghost" size="icon" onMouseEnter={() => prefetchUser(user.id)} aria-label={`${t('manageUsers.editUserSr')} ${user.name}`}>
                <Link href={`/admin/manage-users/${user.id}/edit`}>
                   <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
        </TableRow>
    );
}

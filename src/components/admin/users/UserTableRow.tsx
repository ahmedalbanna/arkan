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
import { fetchUserProfileApi } from "@/services";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks";
import { createConversationApi } from "@/services";
import { toast } from "@/hooks";
import { useLocalization } from "@/context/LocalizationContext";
import { User } from '@/lib/models/user'; // NEW: Import our class

interface UserTableRowProps {
    user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
    const { t } = useLocalization();
    const queryClient = useQueryClient();
    const { firebaseUser, userProfile: adminProfile } = useAuth();
    const router = useRouter();
    const { createConversation } = useChatStore();

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

    const handleStartChat = async (targetUser: User) => {
        if (!firebaseUser || !adminProfile) return;
        try {
            const token = await firebaseUser.getIdToken();
            const conversation = await createConversationApi({
                participantIds: [firebaseUser.uid, targetUser.id],
                participantNames: {
                    [firebaseUser.uid]: adminProfile.name || 'Admin',
                    [targetUser.id]: targetUser.name
                },
                title: `Chat with ${targetUser.name}`
            }, token);
            createConversation(conversation);
            router.push('/admin/chats');
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to start chat: ${error.message}`, variant: 'destructive' });
        }
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
               <Button variant="ghost" size="icon" onClick={() => handleStartChat(user)}>
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

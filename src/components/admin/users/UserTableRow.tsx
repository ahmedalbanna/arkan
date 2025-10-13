
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useLocalization } from "@/context/LocalizationContext";
import { toast, useChatStore } from "@/hooks";
import { userKeys } from '@/lib/core/query-keys';
import { User } from '@/lib/models/user'; // NEW: Import our class
import { createConversationApi, fetchUserProfileApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { MessageSquare, Pencil, User as UserIcon } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";

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
        <TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200 group">
            <TableCell className="font-medium group-hover:text-primary">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-gradient-to-br from-primary to-primary-600">
                        <UserIcon className="h-3 w-3 text-white" />
                    </div>
                    {user.name}
                </div>
            </TableCell>
            <TableCell className="group-hover:text-primary">{user.email}</TableCell>
            <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="shadow-soft">
                    {t(`roles.${user.role}`)}
                </Badge>
            </TableCell>
            <TableCell className="group-hover:text-primary">{user.credits}</TableCell>
            <TableCell className="group-hover:text-primary">{user.createdAt ? format(new Date(user.createdAt), 'd MMM yyyy') : 'N/A'}</TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartChat(user)}
                        className="hover:shadow-glow hover:scale-105 transition-all duration-200"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">{t('manageUsers.chatWithUserSr')}</span>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        onMouseEnter={() => prefetchUser(user.id)}
                        aria-label={`${t('manageUsers.editUserSr')} ${user.name}`}
                        className="hover:shadow-glow hover:scale-105 transition-all duration-200"
                    >
                        <Link href={`/admin/manage-users/${user.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

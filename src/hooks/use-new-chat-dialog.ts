
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast, useChatStore, useUsers } from '@/hooks';
import type { User } from '@/lib/models/user';
import { createConversationApi } from '@/services';
import { useState } from 'react';


export function useNewChatDialog() {
    const [open, setOpen] = useState(false);
    const { firebaseUser, userProfile: adminProfile } = useAuth();
    const { createConversation } = useChatStore();
    const [isCreating, setIsCreating] = useState(false);

    const {
        data,
        isLoading: usersLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useUsers();

    const allUsers = data?.pages.flatMap(page => (page as any).users) ?? [];

    const onSelectUser = async (user: User) => {
        if (!firebaseUser || !adminProfile) return;
        setIsCreating(true);
        try {
            const token = await firebaseUser.getIdToken();
            const conversation = await createConversationApi({
                participantIds: [firebaseUser.uid, user.id],
                participantNames: {
                    [firebaseUser.uid]: adminProfile.name || 'Admin',
                    [user.id]: user.name
                },
                title: `Chat with ${user.name}`
            }, token);
            createConversation(conversation);
            setOpen(false);
        } catch (error: any) {
            toast({ title: "Error starting chat", description: error.message, variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    return {
        open,
        setOpen,
        allUsers,
        usersLoading,
        hasNextPage,
        isFetchingNextPage,
        isCreating,
        fetchNextPage,
        onSelectUser,
    };
}

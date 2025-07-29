'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Pencil, ChevronLeft, ChevronRight, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { userKeys } from '@/lib/query-keys';
import { fetchUserProfile, fetchUsers } from '@/services/user-service';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { CreateUserDialog } from './CreateUserDialog';
import { useChatStore } from '@/hooks/useChatStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createConversationApi } from '@/services/chat-service';


const USERS_PER_PAGE = 10;

function UserTableSkeleton() {
    const { t } = useLocalization();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('manageUsers.tableHeadName')}</TableHead>
                    <TableHead>{t('manageUsers.tableHeadEmail')}</TableHead>
                    <TableHead>{t('manageUsers.tableHeadRole')}</TableHead>
                    <TableHead>{t('manageUsers.tableHeadCredits')}</TableHead>
                    <TableHead>{t('manageUsers.tableHeadJoined')}</TableHead>
                    <TableHead className="text-right">{t('manageUsers.tableHeadActions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: USERS_PER_PAGE }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function UserManagementConsole() {
  const { t } = useLocalization();
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile: adminProfile, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { createConversation, openChat } = useChatStore();

  const { 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage, 
    status 
  } = useInfiniteQuery({
      queryKey: userKeys.lists(),
      queryFn: async ({ pageParam }) => {
          if (!firebaseUser) throw new Error("User not authenticated");
          const token = await firebaseUser.getIdToken();
          return fetchUsers(USERS_PER_PAGE, pageParam, token);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
          if (!lastPage.hasNextPage) return undefined;
          return lastPage.lastVisibleId;
      },
      enabled: !!firebaseUser
  });

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  // Prefetch user profile on hover for a smoother navigation experience
  const prefetchUser = async (userId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    await queryClient.prefetchQuery({
        queryKey: userKeys.profile(userId),
        queryFn: () => fetchUserProfile(userId, token),
        staleTime: 1000 * 60 * 1, // Prefetched data is fresh for 1 minute
    });
  }

  const handleStartChat = async (targetUser: UserProfile) => {
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
  }

  const isLoading = status === 'pending' || authIsLoading;
  const isError = status === 'error';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
                <span>{t('manageUsers.cardTitle')}</span>
                 {isFetching && !isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <UserTableSkeleton />
        ) : isError ? (
            <div className="p-8 text-center text-destructive">
                 <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('manageUsers.errorLoading')}: {error?.message}</p>
            </div>
        ) : (
            <>
                <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('manageUsers.tableHeadName')}</TableHead>
                          <TableHead>{t('manageUsers.tableHeadEmail')}</TableHead>
                          <TableHead>{t('manageUsers.tableHeadRole')}</TableHead>
                          <TableHead>{t('manageUsers.tableHeadCredits')}</TableHead>
                          <TableHead>{t('manageUsers.tableHeadJoined')}</TableHead>
                          <TableHead className="text-right">{t('manageUsers.tableHeadActions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {t(`roles.${user.role}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.credits}</TableCell>
                            <TableCell>{format(new Date(user.createdAt), 'd MMM yyyy')}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={() => handleStartChat(user)} aria-label={`Chat with ${user.name}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              <Button asChild variant="ghost" size="icon" onMouseEnter={() => prefetchUser(user.id)} aria-label={`Edit ${user.name}`}>
                                <Link href={`/admin/manage-users/${user.id}/edit`}>
                                   <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-center pt-8">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                    >
                        {isFetchingNextPage
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : null}
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}



'use client';

import { useState } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
                {Array.from({ length: 5 }).map((_, i) => (
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
  const [page, setPage] = useState(1);
  const { t } = useLocalization();
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile: adminProfile, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { createConversation, openChat } = useChatStore();


  const { data: users, isLoading, isError, isFetching } = useQuery({
      queryKey: userKeys.list(page),
      queryFn: async () => {
          if (!firebaseUser) throw new Error("User not authenticated");
          const token = await firebaseUser.getIdToken();
          return fetchUsers(page, USERS_PER_PAGE, token);
      },
      placeholderData: (previousData) => previousData,
      staleTime: 1000 * 60, // 1 minute
      enabled: !!firebaseUser
  });

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

  if (authIsLoading || isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{t('manageUsers.cardTitle')}</span>
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <UserTableSkeleton />
            </CardContent>
        </Card>
    )
  }

  if (isError) {
    return (
        <Card>
            <CardContent className="p-8 text-center text-destructive">
                 <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('manageUsers.errorLoading')}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
                <span>{t('manageUsers.cardTitle')}</span>
                 {isFetching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
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
                {users?.map((user) => (
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
                       <Button variant="ghost" size="icon" onClick={() => handleStartChat(user)}>
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">Chat with user</span>
                        </Button>
                      <Button asChild variant="ghost" size="icon" onMouseEnter={() => prefetchUser(user.id)}>
                        <Link href={`/admin/manage-users/${user.id}/edit`}>
                           <Pencil className="h-4 w-4" />
                           <span className="sr-only">{t('manageUsers.editUserSr')}</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1 || isFetching}
            >
                <ChevronLeft className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                {t('manageUsers.previousButton')}
            </Button>
            <span className="text-sm font-medium">{t('manageUsers.pageLabel')} {page}</span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!users || users.length < USERS_PER_PAGE || isFetching}
            >
                {t('manageUsers.nextButton')}
                <ChevronRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

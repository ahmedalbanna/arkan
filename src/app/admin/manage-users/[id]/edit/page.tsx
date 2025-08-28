
'use client';

import { useUserProfile } from '@/hooks/use-user';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useEffect, use, lazy, Suspense } from 'react';

// Dynamically import the EditUserForm
const EditUserForm = lazy(() => import('@/components/admin/EditUserForm'));

function EditUserPageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <Skeleton className="w-10 h-10 rounded-full mx-auto" />
        <Skeleton className="h-10 w-64 mx-auto mt-4" />
        <Skeleton className="h-6 w-80 mx-auto mt-2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

function EditUserPageContent({ userId }: { userId: string }) {
    const { data: user, isLoading, isError } = useUserProfile(userId);
    const { firebaseUser, isLoading: authIsLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !authIsLoading && user?.id !== firebaseUser?.uid && user?.role !== 'admin') {
          // notFound();
        }
    }, [user, firebaseUser, isLoading, authIsLoading]);

    if (isLoading || authIsLoading) {
      return <EditUserPageSkeleton />;
    }

    if (isError || !user) {
      notFound();
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <HeaderSection userName={user.name} />
            <Suspense fallback={<EditUserPageSkeleton />}>
                <EditUserForm user={user} />
            </Suspense>
        </div>
    );
}

function HeaderSection({ userName }: { userName: string }) {
  const { t } = useLocalization();
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
        <UserCog className="w-10 h-10" />
        {t('editUser.pageTitle')}
      </h1>
      <p className="text-lg text-muted-foreground mt-2">
        {t('editUser.pageSubtitle').replace('{userName}', userName)}
      </p>
    </div>
  )
}


export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <EditUserPageContent userId={resolvedParams.id} />
}

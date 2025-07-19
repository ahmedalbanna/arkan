
'use client';

import EditUserForm from '@/components/EditUserForm';
import { useUserProfile } from '@/hooks/use-user';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '@/components/ui/skeleton';

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

// This is now a fully client component to use the useUserProfile hook
export default function EditUserPage({ params: { id } }: { params: { id: string } }) {
  const { data: user, isLoading, isError } = useUserProfile(id);

  if (isLoading) {
    return <EditUserPageSkeleton />;
  }

  if (isError || !user) {
    notFound();
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <HeaderSection userName={user.name} />
      <EditUserForm user={user} />
    </div>
  );
}

// Client component to handle localization
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

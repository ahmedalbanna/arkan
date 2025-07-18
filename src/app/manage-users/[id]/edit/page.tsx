
'use client';

import EditUserForm from '@/components/EditUserForm';
import { getUserProfile } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

// This is a server component that fetches initial data, but the form it renders is a client component
export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUserProfile(params.id);

  if (!user) {
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

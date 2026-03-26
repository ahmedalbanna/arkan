import UserManagementConsole from '@/modules/users/adapters/components/admin/UserManagementConsole';
import { Users } from 'lucide-react';
import { getTranslator } from '@/lib/utils/i18n';

export default async function ManageUsersPage() {
  const t = await getTranslator();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Users className="w-10 h-10" />
          {t('manageUsers.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('manageUsers.pageSubtitle')}
        </p>
      </div>
      <UserManagementConsole />
    </div>
  );
}

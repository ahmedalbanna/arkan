import UserManagementConsole from '@/components/UserManagementConsole';
import { Users } from 'lucide-react';
import { getAllUsers } from '@/lib/db/queries';

export default async function ManageUsersPage() {
  const users = await getAllUsers();
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Users className="w-10 h-10" />
          User Management
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Oversee, edit, and manage all users on the platform.
        </p>
      </div>
      <UserManagementConsole users={users} />
    </div>
  );
}

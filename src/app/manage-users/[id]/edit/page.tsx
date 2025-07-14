import EditUserForm from '@/components/EditUserForm';
import { getUserProfile } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getUserProfile(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <UserCog className="w-10 h-10" />
          Edit User
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Modify the details for {user.name}.
        </p>
      </div>
      <EditUserForm user={user} />
    </div>
  );
}

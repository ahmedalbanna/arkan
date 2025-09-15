'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Gem, Calendar, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';
import { useUserProfile } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { use, Suspense, lazy } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const EditUserForm = lazy(() => import('@/components/admin/EditUserForm'));

function ProfileSkeleton() {
    return (
        <Card>
            <CardHeader className="text-center">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-6 w-56 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="mt-4 space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-4/5" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32 ml-auto" />
            </CardFooter>
        </Card>
    );
}

function ProfilePageContent({ userId }: { userId: string }) {
  const { t } = useLocalization();
  const { data: user, isLoading } = useUserProfile(userId);
  const { userProfile: currentUser, firebaseUser } = useAuth();
  
  const canEdit = currentUser?.role === 'admin' || currentUser?.id === userId;

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <ProfileSkeleton />
        </div>
    );
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
              <AvatarImage src={user.profilePictureUrl ?? ''} alt={user.name} />
              <AvatarFallback className="text-3xl">
                {user.getInitials()}
              </AvatarFallback>
            </Avatar>
          <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-6">
           <div className="p-4 rounded-lg bg-muted border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('profile.creditsLabel')}</span>
                </div>
                <Badge variant="secondary" className="text-lg">{user.credits}</Badge>
           </div>

           <div className="space-y-4">
             <div className="flex items-start gap-3">
               <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
               <div>
                 <h4 className="font-semibold">{t('profile.joinedLabel')}</h4>
                 <p className="text-muted-foreground">{format(new Date(user.createdAt), 'PPP')}</p>
               </div>
             </div>

             {user.bio && (
                 <div className="flex items-start gap-3">
                   <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                   <div>
                     <h4 className="font-semibold">{t('profile.bioLabel')}</h4>
                     <p className="text-muted-foreground">{user.bio}</p>
                   </div>
                 </div>
             )}
           </div>

        </CardContent>
        {canEdit && (
            <CardFooter className="justify-end">
                <Button asChild>
                    <Link href={`/admin/manage-users/${userId}/edit`}>
                        <Pencil className="me-2 h-4 w-4" />
                        Edit Profile
                    </Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

// This is the main export, which is a Client Component wrapper.
export default function ProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  return <ProfilePageContent userId={params.id} />;
}

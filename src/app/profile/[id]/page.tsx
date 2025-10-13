'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useUserProfile } from '@/hooks';
import { format } from 'date-fns';
import { Calendar, Clock, Gem, Mail, Pencil, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lazy, use } from 'react';

const EditUserForm = lazy(() => import('@/components/admin/EditUserForm'));

function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-12">
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft">
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
        </AnimatedContainer>
      </div>
    </div>
  );
}

function ProfilePageContent({ userId }: { userId: string }) {
  const { t } = useLocalization();
  const { data: user, isLoading } = useUserProfile(userId);
  const { userProfile: currentUser, firebaseUser } = useAuth();

  const canEdit = currentUser?.role === 'admin' || currentUser?.id === userId;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-12">
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft">
            <CardHeader className="text-center">
              <AnimatedContainer animation="fade-in-down" delay={400}>
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20 shadow-glow">
                  <AvatarImage src={user.profilePictureUrl ?? ''} alt={user.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary-600 text-white">
                    {user.getInitials()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl font-headline bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {user.name}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </AnimatedContainer>
            </CardHeader>

            <CardContent className="mt-4 space-y-6">
              <AnimatedContainer animation="fade-in-up" delay={600}>
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-between hover:shadow-soft transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                      <Gem className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-lg">{t('profile.creditsLabel')}</span>
                      <p className="text-sm text-muted-foreground">Available credits</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20">
                    {user.credits}
                  </Badge>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation="fade-in-up" delay={800}>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors">
                    <div className="p-2 rounded bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {t('profile.joinedLabel')}
                      </h4>
                      <p className="text-muted-foreground">
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors">
                      <div className="p-2 rounded bg-purple-500/10">
                        <User className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('profile.bioLabel')}</h4>
                        <p className="text-muted-foreground">{user.bio}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors">
                    <div className="p-2 rounded bg-emerald-500/10">
                      <Shield className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Account Status</h4>
                      <p className="text-muted-foreground">Active and verified</p>
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            </CardContent>

            {canEdit && (
              <CardFooter className="justify-end">
                <AnimatedContainer animation="fade-in-up" delay={1000}>
                  <Button asChild className="hover:shadow-glow transition-all duration-200" variant="gradient">
                    <Link href={`/admin/manage-users/${userId}/edit`}>
                      <Pencil className="me-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </AnimatedContainer>
              </CardFooter>
            )}
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}

// This is the main export, which is a Client Component wrapper.
export default function ProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  return <ProfilePageContent userId={params.id} />;
}

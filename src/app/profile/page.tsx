'use client';

import { useAuth } from '@/context/AuthContext';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { UpdateProfileForm } from './UpdateProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ApiTokenView } from './ApiTokenView';
import { ApiKeysForm } from './ApiKeysForm';
import { GuestProfilePage } from '@/modules/users/adapters/components/auth/GuestProfilePage';
import { TrustedDevicesList } from './TrustedDevicesList';
import { LoginHistoryList } from './LoginHistoryList';
import { SecuritySettingsForm } from './SecuritySettingsForm';
import { TwoFactorSetup } from './TwoFactorSetup';

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-6 w-56 mx-auto mt-2" />
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProfilePage() {
    const { t } = useLocalization();
    const { userProfile, firebaseUser, isLoading, isGuest } = useAuth();

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12">
                <ProfileSkeleton />
            </div>
        );
    }

    if (isGuest) {
        return <GuestProfilePage />;
    }

    if (!userProfile || !firebaseUser) {
        notFound();
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
            <header className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                    <AvatarImage src={userProfile.profilePictureUrl ?? ''} alt={userProfile.name} />
                    <AvatarFallback className="text-3xl">{userProfile.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold font-headline">{userProfile.name}</h1>
                <p className="text-muted-foreground">{userProfile.email}</p>
            </header>

            <UpdateProfileForm userProfile={userProfile} />
            <ApiKeysForm userProfile={userProfile} />
            <SecuritySettingsForm userProfile={userProfile} />
            <TwoFactorSetup isAlreadyEnabled={!!(userProfile as any).isTwoFactorEnabled} />
            <ChangePasswordForm />
            <TrustedDevicesList userId={userProfile.id} currentTokenVersion={(userProfile as any).tokenVersion} />
            <LoginHistoryList userId={userProfile.id} />
            <ApiTokenView />

        </div>
    );
}

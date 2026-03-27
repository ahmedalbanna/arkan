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

import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User as UserIcon, Globe, Lock, Key, Smartphone, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

export default function ProfilePage() {
    const { t } = useLocalization();
    const { userProfile, user, isLoading, isGuest } = useAuth();

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background relative overflow-hidden items-center justify-center">
                <div className="space-y-4 text-center opacity-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing User Identity</p>
                </div>
            </div>
        );
    }

    if (isGuest) {
        return <GuestProfilePage />;
    }

    if (!userProfile || !user) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
                }}
            />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="container relative z-10 mx-auto max-w-[1400px] px-6 py-20 md:py-32">
                {/* Premium Identity Header */}
                <div className="flex flex-col items-center text-center mb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <Avatar className="w-32 h-32 relative border-none shadow-2xl rounded-[36px] bg-background p-1 ring-1 ring-black/5 dark:ring-white/10">
                            <AvatarImage src={userProfile.profilePictureUrl ?? ''} alt={userProfile.name} className="rounded-[32px] object-cover" />
                            <AvatarFallback className="text-4xl font-headline bg-primary/5 text-primary rounded-[32px]">{userProfile.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-background border shadow-lg rounded-xl p-1.5 animate-bounce">
                            <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Verified Node</Badge>
                            <div className="h-3 w-px bg-primary/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{userProfile.role} Entity</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-foreground leading-tight">{userProfile.name}</h1>
                        <p className="text-xl text-muted-foreground italic font-serif opacity-60">{userProfile.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Personal Matrix */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Identity Matrix</h3>
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <UpdateProfileForm userProfile={userProfile} />
                            <ApiKeysForm userProfile={userProfile} />
                            <ApiTokenView />
                        </div>
                    </div>

                    {/* Right: Security Protocol */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Security Protocol</h3>
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                            <SecuritySettingsForm userProfile={userProfile} />
                            <TwoFactorSetup isAlreadyEnabled={!!(userProfile as any).isTwoFactorEnabled} />
                            <ChangePasswordForm />
                            <TrustedDevicesList userId={userProfile.id} currentTokenVersion={(userProfile as any).tokenVersion} />
                            <LoginHistoryList userId={userProfile.id} />
                        </div>
                    </div>
                </div>

                <footer className="mt-32 pt-12 border-t border-border/40 text-center space-y-4">
                    <div className="flex justify-center items-center gap-6 opacity-20 grayscale">
                        <ShieldCheck className="h-8 w-8" />
                        <Lock className="h-8 w-8" />
                        <Activity className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                        Arkan Intelligence Suite • Secure Identity Node V1.0
                    </p>
                </footer>
            </div>
        </div>
    );
}

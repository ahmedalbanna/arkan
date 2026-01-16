'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import Link from 'next/link';

export function GuestProfilePage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <Card>
                <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-dashed border-muted-foreground/50">
                        <AvatarFallback className="text-4xl bg-muted">
                            <User className="h-12 w-12 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-headline">Guest User</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">You are browsing as a guest.</CardDescription>
                </CardHeader>
                <CardContent className="mt-4 text-center space-y-4">
                    <p>Your work is saved locally on this device. To save your projects to the cloud, use AI features, and access your work from anywhere, please create an account.</p>
                    <Button asChild size="lg">
                        <Link href="/signup">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign Up to Save Your Work
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

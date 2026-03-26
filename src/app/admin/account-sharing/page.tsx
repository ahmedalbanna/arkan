'use client';

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { AdminApiClient } from "@/modules/admin/adapters/api-client/AdminApiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountSharingAlert } from '@/modules/admin/adapters/components/dashboard/AccountSharingAlert';
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountSharingDashboard() {
    const { firebaseUser } = useAuth();
    
    const { data, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const client = container.resolve(AdminApiClient);
            // We need a way to pass the token if required, but AdminApiClient 
            // usually uses the authenticated-client-call internally.
            // For now let's assume it works like other admin pages.
            const result = await client.fetchDashboardStats(); 
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        enabled: !!firebaseUser
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const report = data?.accountSharingReport || [];

    return (
        <div className="container mx-auto py-8 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Sharing Monitor</h1>
                    <p className="text-muted-foreground">Monitor and detect suspicious login patterns and shared credentials.</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                    <ShieldCheck className="h-8 w-8" />
                </div>
            </header>

            {report.length > 0 ? (
                <AccountSharingAlert report={report} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Clear</CardTitle>
                        <CardDescription>No suspicious account sharing patterns detected at this time.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground italic">
                        No users currently exceed the 3-device threshold.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

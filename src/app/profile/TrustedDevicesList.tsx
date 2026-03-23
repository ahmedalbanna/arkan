'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { UserApiClient } from "@/modules/users/adapters/api-client/UserApiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Globe, Clock, XCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks";

interface TrustedDevicesListProps {
    userId: string;
}

export function TrustedDevicesList({ userId }: TrustedDevicesListProps) {
    const queryClient = useQueryClient();
    const { data: fingerprints, isLoading } = useQuery({
        queryKey: ['user-fingerprints', userId],
        queryFn: async () => {
            const client = container.resolve(UserApiClient);
            const result = await client.fetchUserFingerprints(userId);
            if (result.isFailure) throw result.error;
            return result.getValue();
        }
    });

    const revokeMutation = useMutation({
        mutationFn: async (fingerprintId: string) => {
            const client = container.resolve(UserApiClient);
            const result = await client.revokeUserFingerprint(userId, fingerprintId);
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        onSuccess: () => {
            toast({ title: 'Access Revoked', description: 'This device will no longer have access to your account.' });
            queryClient.invalidateQueries({ queryKey: ['user-fingerprints', userId] });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trusted Devices</CardTitle>
                <CardDescription>Recognized devices and browsers that have accessed your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {fingerprints?.map((device) => (
                        <div key={device.id} className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="rounded-full bg-primary/10 p-2">
                                {device.metadata.userAgent?.includes('Mobi') ? (
                                    <Smartphone className="h-5 w-5 text-primary" />
                                ) : (
                                    <Monitor className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {device.metadata.platform || 'Unknown Device'}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {device.metadata.language}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {device.metadata.userAgent}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                                    <Clock className="h-3 w-3" />
                                    Last seen: {new Date(device.lastUsedAt).toLocaleString()}
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => revokeMutation.mutate(device.id)}
                                disabled={revokeMutation.isPending}
                            >
                                {revokeMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                <span className="sr-only">Revoke Access</span>
                            </Button>
                        </div>
                    ))}
                    {fingerprints?.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">No device data available yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

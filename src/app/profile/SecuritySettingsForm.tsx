'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks';
import { User, SecuritySettings } from '@/modules/users/domain/entities/User';
import { apiService } from '@/infrastructure/api/ApiService';
import { ShieldCheck, Mail, Loader2, LogOut } from 'lucide-react';
import { useLogoutAllDevices } from '@/hooks/auth/use-auth-mutations';

interface SecuritySettingsFormProps {
    userProfile: User;
}

export function SecuritySettingsForm({ userProfile }: SecuritySettingsFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const logoutAllMutation = useLogoutAllDevices();
    const [settings, setSettings] = useState<SecuritySettings>(
        userProfile.securitySettings || { enableLoginAlerts: true }
    );

    const handleToggleAlerts = async (checked: boolean) => {
        const newSettings = { ...settings, enableLoginAlerts: checked };
        setSettings(newSettings);
        
        setIsLoading(true);
        try {
            await apiService({
                endpoint: `/api/users/${userProfile.id}`,
                method: 'PUT',
                data: { securitySettings: newSettings }
            });
            toast({ title: 'Settings Updated', description: 'Your security preferences have been saved.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update settings.', variant: 'destructive' });
            // Rollback on failure
            setSettings(settings);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Security Settings
                </CardTitle>
                <CardDescription>Manage your account security preferences and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="login-alerts" className="text-base font-medium">Login Alerts</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Receive an email notification whenever a new device or IP logs into your account.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <Switch
                            id="login-alerts"
                            checked={settings.enableLoginAlerts}
                            onCheckedChange={handleToggleAlerts}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium">Session Management</h4>
                            <p className="text-sm text-muted-foreground">
                                If you suspect your account is being used by someone else, you can force a logout on all your active devices.
                            </p>
                        </div>
                        <Button 
                            variant="destructive" 
                            className="w-full sm:w-auto"
                            onClick={() => logoutAllMutation.mutate()}
                            disabled={logoutAllMutation.isPending}
                        >
                            {logoutAllMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                            )}
                            Force Logout All Devices
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

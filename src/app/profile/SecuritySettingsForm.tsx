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
import { useLogoutAllDevices } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { Badge } from '@/components/ui/badge';

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
            setSettings(settings);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        Guard Node Settings
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-destructive/20 text-destructive bg-destructive/5">
                    Secured Node
                </Badge>
            </header>

            <CardContent className="p-8 md:p-10 space-y-10">
                <div className="group relative flex items-center justify-between p-6 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110 shadow-inner">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold tracking-tight">Linguistic Alerts</h4>
                            <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-xs">
                                Receive secure transmission logs for every new system entry.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/40" />}
                        <Switch
                            id="login-alerts"
                            checked={settings.enableLoginAlerts}
                            onCheckedChange={handleToggleAlerts}
                            disabled={isLoading}
                            className="scale-90"
                        />
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive/40" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Termination</h4>
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-destructive/20 bg-destructive/[0.02] space-y-6">
                        <p className="text-[11px] text-destructive/80 italic leading-relaxed">
                            Initialize a global session override to immediate invalidate all active system nodes. Use this if security has been compromised.
                        </p>

                        <Button
                            variant="destructive"
                            className="w-full font-bold h-11 rounded-xl shadow-xl shadow-destructive/20 gap-3 transition-all active:scale-95"
                            onClick={() => logoutAllMutation.mutate()}
                            disabled={logoutAllMutation.isPending}
                        >
                            {logoutAllMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            Force Global Node Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

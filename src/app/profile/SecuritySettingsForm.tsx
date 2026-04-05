'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks';
import { User, SecuritySettings } from '@/modules/users/domain/entities/User';
import { apiService } from '@/infrastructure/api/ApiService';
import { ShieldCheck, Mail, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useLogoutAllDevices } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { Badge } from '@/components/ui/badge';

/**
 * SecuritySettingsForm — Guard node configuration for system access and session control.
 * 
 * DEFENSIVE MEASURES:
 * 1. Prop Integrity: Handles null userProfile with fallback HUD.
 * 2. Optimistic Safety: Implements rollback logic for toggle failures.
 * 3. Execution Guard: Prevents duplicate session resets and handles mutation pending states.
 * 4. User Feedback: Integrated system transmission logs and error toasts.
 */

interface SecuritySettingsFormProps {
    userProfile: User | null;
}

export function SecuritySettingsForm({ userProfile }: SecuritySettingsFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const logoutAllMutation = useLogoutAllDevices();
    
    const [settings, setSettings] = useState<SecuritySettings>(
        userProfile?.securitySettings || { enableLoginAlerts: true }
    );

    // 1. OPTIMISTIC UPDATE VECTOR — With robust rollback
    const handleToggleAlerts = useCallback(async (checked: boolean) => {
        if (!userProfile?.id) return;

        const previousSettings = { ...settings };
        const newSettings = { ...settings, enableLoginAlerts: checked };
        
        setSettings(newSettings);
        setIsLoading(true);

        try {
            await apiService({
                endpoint: `/api/users/${userProfile.id}`,
                method: 'PUT',
                data: { securitySettings: newSettings }
            });
            toast({ title: 'System Synchronized', description: 'Your security preferences have been saved to the manifest.' });
        } catch (error) {
            console.error('[SecuritySettings] Preference sync failed:', error);
            toast({ title: 'Transmission Error', description: 'Failed to update security parameters.', variant: 'destructive' });
            // Rollback to consistent state
            setSettings(previousSettings);
        } finally {
            setIsLoading(false);
        }
    }, [settings, userProfile?.id, toast]);

    if (!userProfile) {
        return (
            <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] p-12 text-center opacity-40">
                <div className="p-6 rounded-[24px] bg-destructive/5 border border-dashed border-destructive/20 shadow-inner w-fit mx-auto mb-4">
                    <ShieldAlert className="h-10 w-10 text-destructive/40" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Security Node Offline</p>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] relative">
            {/* Dot-grid atmosphere — Standardized alignment (28px) */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        Guard Node Settings
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-[0.25em] font-black border-destructive/20 text-destructive bg-destructive/5 px-2.5 rounded-full shadow-inner ring-1 ring-inset ring-destructive/10">
                    Secured Node
                </Badge>
            </header>

            <CardContent className="p-8 md:p-10 space-y-10 relative z-10">
                {/* Linguistic Alerts Module */}
                <div className="group relative flex items-center justify-between p-6 rounded-[28px] border border-border/60 bg-background/60 backdrop-blur-md hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="h-12 w-12 rounded-[18px] bg-primary/10 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-tight text-foreground/80">Linguistic Alerts</h4>
                            <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-xs font-medium">
                                Receive secure transmission logs for every new system entry attempt.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/40" />}
                        <Switch
                            id="login-alerts"
                            checked={settings.enableLoginAlerts}
                            onCheckedChange={handleToggleAlerts}
                            disabled={isLoading}
                            className="scale-90 data-[state=checked]:bg-primary"
                        />
                    </div>
                </div>

                {/* Session Termination Protocol */}
                <div className="space-y-6 pt-4 relative">
                    {/* Depth architectural line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-destructive/30 via-destructive/5 to-transparent" />

                    <div className="flex items-center gap-3 px-1 relative z-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive/40 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Session Termination</h4>
                    </div>

                    <div className="p-8 rounded-[32px] border border-dashed border-destructive/20 bg-destructive/[0.02] space-y-8 relative z-10 group/session">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="h-5 w-5 text-destructive/60 mt-0.5" />
                            <p className="text-[11px] text-destructive/80 italic leading-relaxed font-medium">
                                Initialize a global session override to immediate invalidate all active system nodes. This protocol should only be engaged if structural integrity is compromised.
                            </p>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full font-black h-12 rounded-xl shadow-2xl shadow-destructive/20 gap-3 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-[0.2em] text-[10px] ring-1 ring-inset ring-white/10"
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

            {/* Stable Version Footer */}
            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-destructive/30" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Guard Node</span>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">v2.1.0-STABLE</span>
            </footer>
        </Card>
    );
}

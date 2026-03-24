'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks';
import { ShieldCheck, Smartphone, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiService } from '@/infrastructure/api/ApiService';
import Image from 'next/image';

interface TwoFactorSetupProps {
    isAlreadyEnabled: boolean;
}

export function TwoFactorSetup({ isAlreadyEnabled }: TwoFactorSetupProps) {
    const { toast } = useToast();
    const [step, setSetupStep] = useState<'initial' | 'setup' | 'verify' | 'success'>(
        isAlreadyEnabled ? 'success' : 'initial'
    );
    const [qrCode, setQrCode] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStartSetup = async () => {
        setIsLoading(true);
        try {
            const data = await apiService<undefined, { qrCode: string }>({
                endpoint: '/api/auth/2fa/setup',
                method: 'POST'
            });
            setQrCode(data.qrCode);
            setSetupStep('setup');
        } catch (error) {
            toast({ title: 'Setup Failed', description: 'Could not initiate 2FA setup.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (token.length !== 6) return;
        setIsLoading(true);
        try {
            await apiService({
                endpoint: '/api/auth/2fa/enable',
                method: 'POST',
                data: { token }
            });
            setSetupStep('success');
            toast({ title: '2FA Enabled', description: 'Your account is now protected with 2FA.' });
        } catch (error) {
            toast({ title: 'Verification Failed', description: 'Invalid 2FA code. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        Two-Factor Authentication Active
                    </CardTitle>
                    <CardDescription>
                        Your account is secured with a second layer of protection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-green-600">
                        You will be prompted for a security code whenever you log in from a new session.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account using an authenticator app.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {step === 'initial' && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                Recommended: 2FA helps prevent unauthorized access even if your password is stolen.
                            </div>
                        </div>
                        <Button onClick={handleStartSetup} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Setup 2FA
                        </Button>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="space-y-6 flex flex-col items-center text-center">
                        <div className="space-y-2">
                            <h4 className="font-semibold">1. Scan this QR Code</h4>
                            <p className="text-sm text-muted-foreground">Open your authenticator app (Google Authenticator, Authy, etc.) and scan the code below.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            {qrCode && <img src={qrCode} alt="2FA QR Code" width={200} height={200} className="mx-auto" />}
                        </div>
                        <Button onClick={() => setSetupStep('verify')} className="w-full">
                            I've scanned it, continue
                        </Button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">2. Enter verification code</Label>
                            <Input 
                                id="token" 
                                placeholder="000000" 
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                            />
                            <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code from your app.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setSetupStep('setup')}>Back</Button>
                            <Button className="flex-1" onClick={handleVerify} disabled={token.length !== 6 || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Verify & Enable
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

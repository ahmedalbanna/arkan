'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Check, Copy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';

export function ApiTokenView() {
  const { firebaseUser } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleShowToken = async () => {
    if (firebaseUser) {
      const idToken = await getAuthenticatedToken(firebaseUser);
      setToken(idToken);
    }
  };

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    toast({ title: 'Token Copied!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader><CardTitle>API Access Token</CardTitle><CardDescription>Use this token to authenticate with the Arkan API for external integrations.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>Warning:</strong> Treat this token like a password. Do not share it or expose it in client-side code.</AlertDescription></Alert>
        {token ? <div className="flex items-center gap-2"><Input readOnly value={token} className="font-mono text-xs" /><Button variant="outline" size="icon" onClick={handleCopy}>{isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button></div> : <p className="text-sm text-muted-foreground">Click the button to reveal your access token.</p>}
      </CardContent>
      <CardFooter><Button onClick={handleShowToken}>{token ? 'Refresh Token' : 'Show Token'}</Button></CardFooter>
    </Card>
  );
}

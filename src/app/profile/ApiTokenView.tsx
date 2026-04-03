'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ApiTokenView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Security</CardTitle>
        <CardDescription>Arkan uses industry-standard secure session management.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            <strong>HttpOnly Cookies:</strong> Your session token is stored in a secure, encrypted cookie that cannot be accessed by scripts, protecting you from cross-site scripting (XSS) attacks.
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          For your security, session tokens are not revealed in the UI. External API integrations should use the AI Provider API Keys configured in the section above.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" disabled className="w-full">
          <Lock className="mr-2 h-4 w-4" />
          Session Securely Managed
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PhoneAuthForm() {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Supported</AlertTitle>
        <AlertDescription>
          Phone authentication is currently not supported in the local authentication system. 
          Please use your email and password to log in.
        </AlertDescription>
      </Alert>
      
      <Button asChild className="w-full">
        <Link href="/login">Back to Login</Link>
      </Button>
    </div>
  );
}

'use client';

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';
import { Phone } from 'lucide-react';

export default function PhoneAuthPage() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-4">
            <Phone className="w-10 h-10" />
            Sign in with Phone
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Enter your phone number to receive a verification code.
          </p>
        </div>
        <PhoneAuthForm />
      </div>
      </div>
    </ErrorBoundary>
  );
}

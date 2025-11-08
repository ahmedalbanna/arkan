
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePhoneSignIn } from '@/hooks/auth/use-auth-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, 'Please enter a valid phone number including country code (e.g., +15551234567).'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Verification code must be 6 digits.'),
});

export default function PhoneAuthForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { sendOtp, verifyOtp, isLoading, error } = usePhoneSignIn();

  const phoneForm = useForm<{ phoneNumber: string }>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSendOtp = async (values: { phoneNumber: string }) => {
    const result = await sendOtp(values.phoneNumber);
    if (result) {
      setConfirmationResult(result);
      setStep('otp');
    }
  };

  const onVerifyOtp = async (values: { otp: string }) => {
    if (confirmationResult) {
      await verifyOtp(confirmationResult, values.otp);
    }
  };

  return (
    <Card>
      <div id="recaptcha-container"></div>
      {step === 'phone' ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendOtp)}>
            <CardHeader />
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 123 4567" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                Send Verification Code
              </Button>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
            <CardHeader />
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to your phone.
              </p>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Phone } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { Label } from './ui/label';
import { useLogin } from '@/hooks/use-user';
import type { LoginCredentials } from '@/lib/types';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const phoneSchema = z.object({
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

type AuthMode = 'email' | 'phone';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const loginMutation = useLogin();

  const form = useForm({
    resolver: authMode === 'email' ? zodResolver(emailSchema) : zodResolver(phoneSchema),
    defaultValues: {
      email: '',
      password: '',
      phone: '',
    },
  });

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const handlePhoneSubmit = async ({ phone }: { phone: string }) => {
    setIsPhoneLoading(true);
    try {
        const appVerifier = setupRecaptcha();
        const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
        window.confirmationResult = confirmationResult;
        setOtpSent(true);
        toast({ title: 'Verification Code Sent', description: 'Please check your phone for the code.' });
    } catch (error: any) {
        console.error("Phone auth error:", error);
        toast({ title: 'Error Sending Code', description: 'Could not send verification code. Please check the number and try again.', variant: 'destructive' });
    } finally {
        setIsPhoneLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setIsPhoneLoading(true);
    try {
        if (window.confirmationResult) {
            await window.confirmationResult.confirm(otp);
            // After OTP confirmation, Firebase client SDK handles auth state.
            // The onAuthStateChanged listener and session cookie API will take over.
            toast({ title: 'Login Successful', description: "You've been successfully signed in." });
            router.push('/generate');
            router.refresh();
        }
    } catch (error) {
        toast({ title: 'Invalid Code', description: 'The verification code is incorrect. Please try again.', variant: 'destructive' });
    } finally {
        setIsPhoneLoading(false);
    }
  };

  function onSubmit(values: LoginCredentials) {
    if (authMode === 'phone') {
        handlePhoneSubmit({ phone: values.email }); // Reusing the schema field, but it's a phone number
        return;
    }
    loginMutation.mutate(values);
  }

  const isLoading = loginMutation.isPending || isPhoneLoading;

  return (
    <Card>
      <div id="recaptcha-container"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {authMode === 'email' ? 'Login' : 'Sign In with Phone'}
            </CardTitle>
            <CardDescription>
                {authMode === 'email' ? 'Enter your credentials to access your account.' : 'Enter your phone number to receive a verification code.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authMode === 'email' ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : !otpSent ? (
               <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 123 456 7890" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" disabled={isLoading} />
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {authMode === 'phone' && otpSent ? (
                <Button type="button" onClick={handleOtpSubmit} className="w-full font-headline" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Confirm Code
                </Button>
            ) : (
                 <Button type="submit" className="w-full font-headline" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {authMode === 'email' ? 'Sign In' : 'Send Code'}
                </Button>
            )}
            
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => {
                  setAuthMode(authMode === 'email' ? 'phone' : 'email');
                  form.reset();
                  setOtpSent(false);
              }}
            >
              {authMode === 'email' ? (
                <>
                    <Phone className="mr-2 h-4 w-4" /> Sign in with Phone
                </>
              ) : (
                 <>
                    <KeyRound className="mr-2 h-4 w-4" /> Sign in with Email
                 </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

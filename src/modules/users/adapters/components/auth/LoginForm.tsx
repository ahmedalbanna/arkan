'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLogin } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { generateFingerprint } from '@/infrastructure/security/fingerprint';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiService } from '@/infrastructure/api/ApiService';
import { handleErrorUtility } from '@/infrastructure/api/errorUtils';
import { loginSchema as formSchema } from '@/modules/users/domain/schemas/index';

export default function LoginForm() {
  const loginMutation = useLogin();
  const [show2FA, setShow2FA] = useState(false);
  const [tfaUserId, setTfaUserId] = useState('');
  const [tfaToken, setTfaToken] = useState('');
  const [isVerifyingTFA, setIsVerifyingTFA] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { email: '', password: '', rememberMe: false } 
  });

  useEffect(() => { 
    const errorData = loginMutation.error as any; 
    if (errorData?.message) { 
      form.setError('root.serverError', { type: 'manual', message: errorData.message }); 
    } 
  }, [loginMutation.error, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) { 
    form.clearErrors('root.serverError'); 
    
    // Capture Fingerprint
    const { hash, data } = await generateFingerprint();
    
    loginMutation.mutate({
        ...values,
        fingerprint: hash,
        fingerprintData: data
    } as any, {
        onSuccess: (response: any) => {
            if (response.status === 'requires_2fa') {
                setTfaUserId(response.userId);
                setShow2FA(true);
            }
        }
    }); 
  }

  const handleVerify2FA = async () => {
    setIsVerifyingTFA(true);
    try {
        await apiService({
            endpoint: '/api/auth/2fa/verify',
            method: 'POST',
            data: { userId: tfaUserId, token: tfaToken }
        });
        window.location.href = '/builder';
    } catch (error: any) {
        toast({ title: 'Verification Failed', description: error.message || 'Invalid 2FA code.', variant: 'destructive' });
    } finally {
        setIsVerifyingTFA(false);
    }
  };

  const handleGuestLogin = async () => { 
    try { 
      await apiService<undefined, unknown>({ endpoint: '/api/auth/guest', method: 'POST' }); 
      window.location.href = '/builder'; 
    } catch (error) { 
      handleErrorUtility(error, 'Guest Login Failed'); 
    } 
  };

  const isPending = loginMutation.isPending;
  const formLevelError = form.formState.errors.root?.serverError;

  if (show2FA) {
    return (
        <div className="space-y-6 flex flex-col items-center">
            <div className="space-y-2 text-center">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <div className="w-full space-y-4">
                <Input 
                    placeholder="000000" 
                    value={tfaToken}
                    onChange={(e) => setTfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                />
                <Button className="w-full" onClick={handleVerify2FA} disabled={tfaToken.length !== 6 || isVerifyingTFA}>
                    {isVerifyingTFA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Login
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShow2FA(false)}>
                    Back to login
                </Button>
            </div>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {formLevelError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>{formLevelError.message}</AlertDescription>
          </Alert>
        )}
        <FormField 
          control={form.control} 
          name="email" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isPending} />
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
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link href="/forgot-password" className={`ms-auto inline-block text-sm underline ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Remember me
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {loginMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />} 
          Login
        </Button>
        
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue without an account</span>
          </div>
        </div>

        <Button variant="secondary" className="w-full" type="button" onClick={handleGuestLogin} disabled={isPending}>
          Continue as Guest
        </Button>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}

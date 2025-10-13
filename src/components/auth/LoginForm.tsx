'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGoogleSignIn, useLogin } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { LoginCredentials } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleSignInMutation = useGoogleSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const errorData = loginMutation.error as any;
    if (errorData?.message) {
      form.setError("root.serverError", {
        type: "manual",
        message: errorData.message
      });
    }
  }, [loginMutation.error, form]);

  function onSubmit(values: LoginCredentials) {
    // Clear previous server errors before submitting
    form.clearErrors("root.serverError");
    loginMutation.mutate(values);
  }

  const isPending = loginMutation.isPending || googleSignInMutation.isPending;
  const formLevelError = form.formState.errors.root?.serverError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formLevelError && (
          <AnimatedContainer animation="fade-in-down" delay={0}>
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{formLevelError.message}</AlertDescription>
            </Alert>
          </AnimatedContainer>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    disabled={isPending}
                    className="pl-10 transition-all duration-200 focus:shadow-soft"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
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
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    disabled={isPending}
                    className="pl-10 pr-10 transition-all duration-200 focus:shadow-soft"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full hover:shadow-glow transition-all duration-200"
            disabled={isPending}
            variant="gradient"
          >
            {loginMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full hover:shadow-soft transition-all duration-200"
            type="button"
            onClick={() => googleSignInMutation.mutate({})}
            disabled={isPending}
          >
            {googleSignInMutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="me-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.4 56.2l-62.8 55.7C334.3 88.2 294.2 72 248 72 165.2 72 96 141.2 96 224s69.2 152 152 152c86.4 0 142-51.7 148-118.2H248v-73.6h236.3c2.4 12.4 3.7 26.5 3.7 41.6z"></path>
              </svg>
            )}
            Google
          </Button>

          <Button
            variant="outline"
            className="w-full hover:shadow-soft transition-all duration-200"
            type="button"
            onClick={() => router.push('/phone-auth')}
            disabled={isPending}
          >
            <Phone className="me-2 h-4 w-4" />
            Phone Number
          </Button>
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useForgotPasswordLoggedIn } from '@/hooks/auth/use-auth-mutations';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface Strength {
    score: number;
    label: string;
    color: string;
}

function evaluatePasswordStrength(password: string): Strength {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    switch (score) {
        case 0:
        case 1:
            return { score: 20, label: 'Very Weak', color: 'bg-red-500' };
        case 2:
            return { score: 40, label: 'Weak', color: 'bg-red-500' };
        case 3:
            return { score: 60, label: 'Medium', color: 'bg-yellow-500' };
        case 4:
            return { score: 80, label: 'Strong', color: 'bg-green-500' };
        case 5:
            return { score: 100, label: 'Very Strong', color: 'bg-green-500' };
        default:
            return { score: 0, label: '', color: '' };
    }
}


export function ChangePasswordForm() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<Strength | null>(null);

  const forgotPasswordMutation = useForgotPasswordLoggedIn();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
    mode: 'onChange',
  });

  const newPasswordValue = form.watch('newPassword');

  useEffect(() => {
    if (newPasswordValue) {
        setPasswordStrength(evaluatePasswordStrength(newPasswordValue));
    } else {
        setPasswordStrength(null);
    }
  }, [newPasswordValue]);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('User not properly authenticated.');
      }
      const credential = EmailAuthProvider.credential(firebaseUser.email, data.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, data.newPassword);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Your password has been updated.' });
      form.reset();
    },
    onError: (error: any) => {
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'The current password you entered is incorrect.';
      } else if (error.code) {
        description = error.message;
      }
      toast({ title: 'Error', description, variant: 'destructive' });
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  const handleForgotPassword = () => {
    forgotPasswordMutation.mutate();
  };
  
  if (firebaseUser?.providerData?.some((p: any) => p.providerId !== 'password')) {
    return null;
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Current Password</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? 'Sending...' : 'Forgot your password?'}
                    </Button>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input type={showCurrentPassword ? 'text' : 'password'} {...field} disabled={changePasswordMutation.isPending} />
                    </FormControl>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showNewPassword ? 'text' : 'password'} {...field} disabled={changePasswordMutation.isPending} />
                    </FormControl>
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                  {passwordStrength && (
                    <div className="space-y-2 pt-2">
                        <Progress value={passwordStrength.score} className={passwordStrength.color}/>
                        <p className="text-xs font-medium">{passwordStrength.label}</p>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

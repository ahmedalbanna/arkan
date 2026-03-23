'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthApiClient } from '@/modules/users/adapters/api-client/AuthApiClient';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { useToast } from '@/hooks/util/use-toast';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { LoginCredentials } from '@/lib/utils/authUtils';
import { SignupCredentials } from '@/components/auth/SignupForm';

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await container.resolve(AuthApiClient).loginWithEmail(credentials);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      window.location.href = '/builder';
      toast({ title: 'Welcome back!' });
    },
    onError: (error) => handleErrorUtility(error, 'Login Failed'),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await container.resolve(AuthApiClient).serviceLogoutUser();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, 'Logout Failed'),
  });
}

export function useSignup(options?: { onSuccess?: (data: any) => void }) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const client = container.resolve(AuthApiClient);
      const result = await client.serviceSignupUser(credentials);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data) => {
      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created.',
      });
      window.location.href = '/builder';
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleErrorUtility(error, 'Signup Failed');
    },
  });
}

// Placeholders for features to be implemented with local logic later if needed
export function useForgotPassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (_email: string) => {
        throw new Error("Password reset not implemented in local auth yet");
    },
    onError: (error) => handleErrorUtility(error, 'Password Reset Failed'),
  });
}

export function useForgotPasswordLoggedIn() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
        throw new Error("Password reset not implemented in local auth yet");
    },
    onError: (error) => handleErrorUtility(error, 'Failed to send reset email'),
  });
}

export function useSendPasswordReset() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (_userId: string) => {
        throw new Error("Password reset not implemented in local auth yet");
    },
    onError: (error) => {
      handleErrorUtility(error, 'Failed to Send Email');
    },
  });
}

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
import { LoginCredentials } from '@/modules/users/domain/utils/authUtils';
import { SignupCredentials } from '@/modules/users/adapters/components/auth/SignupForm';

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

export function useForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (email: string) => {
        const result = await container.resolve(AuthApiClient).forgotPasswordService(email);
        if (result.isFailure) throw result.error;
        return result.getValue();
    },
    onSuccess: () => {
        toast({
            title: 'Reset link sent',
            description: 'If an account exists with this email, you will receive a reset link shortly.',
        });
        router.push('/login');
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
    mutationFn: async (userId: string) => {
        // In local auth, we might want to expose this to admins 
        // to send a reset link to a specific user by ID
        throw new Error("Admin-initiated password reset not implemented in local auth yet");
    },
    onError: (error) => {
      handleErrorUtility(error, 'Failed to Send Email');
    },
  });
}

export function useResetPassword() {
    const { toast } = useToast();
    const router = useRouter();
    
    return useMutation({
      mutationFn: async ({ token, password }: { token: string, password: string }) => {
          const result = await container.resolve(AuthApiClient).resetPasswordApi(token, password);
          if (result.isFailure) throw result.error;
          return result.getValue();
      },
      onSuccess: () => {
          toast({
              title: 'Password reset successful',
              description: 'Your password has been updated. You can now log in.',
          });
          router.push('/login');
      },
      onError: (error) => handleErrorUtility(error, 'Password Reset Failed'),
    });
}

export function useChangePassword() {
    const { toast } = useToast();
    
    return useMutation({
      mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
          const result = await container.resolve(AuthApiClient).changePasswordApi(data);
          if (result.isFailure) throw result.error;
          return result.getValue();
      },
      onSuccess: () => {
          toast({
              title: 'Password updated',
              description: 'Your password has been changed successfully.',
          });
      },
      onError: (error) => handleErrorUtility(error, 'Password Change Failed'),
    });
}

export function useLogoutAllDevices() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async () => {
          const result = await container.resolve(AuthApiClient).logoutAllDevicesApi();
          if (result.isFailure) throw result.error;
          return result.getValue();
      },
      onSuccess: () => {
          toast({
              title: 'Sessions Invalidated',
              description: 'You have been logged out of all devices.',
          });
          queryClient.clear();
          window.location.href = '/login';
      },
      onError: (error) => handleErrorUtility(error, 'Global Logout Failed'),
    });
}

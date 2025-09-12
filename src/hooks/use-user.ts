// code explantion in docs/hooks/use-user.md

"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-keys";
import type { UserProfile, PricingPlan } from '@/lib/types';
import { toast } from "@/hooks";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client-init";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import {
  fetchUsers as fetchUsersApi,
  subscribeToUserProfile,
  createUserService,
  loginWithEmail,
  loginWithGoogle,
  serviceLogoutUser,
  serviceSignupUser,
  fetchUserProfileApi,
  sendPasswordResetEmailApi,
  forgotPasswordService,
  purchaseCreditsApi,
  type UserListResponse,
  fetchAdmins as fetchAdminsApi,
} from "@/services";
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback, useEffect } from "react";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { User, type UserProperties } from '@/lib/models/user'; // NEW: Import our User class


// --- Custom Hooks ---
const USERS_PER_PAGE = 10;

export function useUsers() {
    const { firebaseUser } = useAuth();
    return useInfiniteQuery<UserListResponse, Error, UserListResponse, string | undefined, string>({
        queryKey: userKeys.lists(),
        queryFn: async ({ pageParam }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return fetchUsersApi(USERS_PER_PAGE, pageParam as string | undefined, token);
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
        enabled: !!firebaseUser,
        // NEW: Transform the data into User instances
        select: (data) => ({
            ...data,
            pages: data.pages.map(page => ({
                ...page,
                users: page.users.map(u => new User(u as UserProperties))
            }))
        })
    });
}

export function useAdmins() {
  const { firebaseUser } = useAuth();
  return useQuery<UserProfile[], Error, User[]>({
    queryKey: userKeys.admins(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchAdminsApi(token);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch administrators"),
    },
    // NEW: Transform the data into User instances
    select: (data: UserProfile[]): User[] => {
        return data.map(u => new User(u as UserProperties));
    }
  });
}

export function useUserProfile(userId: string) {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserProfile(userId, (user) => {
      // When new data comes from the real-time listener,
      // we update the TanStack Query cache directly.
      queryClient.setQueryData(userKeys.profile(userId), user);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [userId, queryClient]);

  // The component will use the data from the cache, which is kept up-to-date
  // by the real-time listener.
  return useQuery<UserProfile | null, Error, User | null>({
    queryKey: userKeys.profile(userId),
    // The queryFn will run on initial load or if the listener fails for some reason
    queryFn: async () => {
        if (!firebaseUser) return null; // Or handle this case as needed
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchUserProfileApi(userId, token);
    },
    staleTime: Infinity, // Data is live, so it's always "fresh"
    enabled: !!userId && !!firebaseUser, // Only run if we have IDs
    // NEW: Transform the data into a User instance
    select: (data: UserProfile | null): User | null => {
        if (!data) return null;
        return new User(data as UserProperties);
    }
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation({
    mutationFn: loginWithEmail,
    onSuccess: (user) => {
      if (user) {
        // After successful login, refetch user data to ensure context is updated
        refetchUser();
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
        router.push("/generate");
        router.refresh();
        toast({
          title: "Login Successful",
          description: "You've been successfully signed in.",
        });
      }
    },
    onError: (error: Error) => {
      // Let the component handle setting form errors
      console.error("Login mutation error:", error);
    },
  });
}

export function useGoogleSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (user) => {
      if (user) {
        refetchUser();
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        router.push("/generate");
        router.refresh();
        toast({
          title: "Sign-In Successful",
          description: `Welcome, ${user.displayName}!`,
        });
      }
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Sign-In Failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceLogoutUser,
    onSuccess: () => {
      queryClient.clear();
      localStorage.clear();
      router.push("/");
      router.refresh();
      toast({
        title: "Logged Out",
        description: "You have been successfully signed out.",
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Logout Error");
    },
  });
}

export function useSignup(options?: { onError?: (error: any) => void }) {
  const router = useRouter();

  return useMutation({
    mutationFn: serviceSignupUser,
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description:
          "Your account has been successfully created. Please log in.",
      });
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Signup mutation error:", error);
      // The component's onError callback will handle form-specific errors.
      if (options?.onError) {
        options.onError(error);
      } else {
        // Fallback for general errors if no specific handler is provided
        handleErrorUtility(error, "Signup Failed");
      }
    },
  });
}

export function useSendPasswordReset() {
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!firebaseUser) throw new Error("Admin not authenticated.");
      const token = await firebaseUser.getIdToken();
      return sendPasswordResetEmailApi(userId, token);
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset Sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Error Sending Reset Email");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordService,
    onSuccess: (data, email) => {
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Error");
    },
  });
}

export function usePhoneSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  const setupRecaptcha = useCallback(() => {
    if (!auth) return;
    try {
      // Check if a verifier already exists
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    } catch (e) {
      console.error("Recaptcha setup error", e);
      setError("Failed to initialize verification. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    // Setup reCAPTCHA on component mount
    setupRecaptcha();
  }, [setupRecaptcha]);

  const sendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      toast({
        title: "Code Sent",
        description: "A verification code has been sent to your phone.",
      });
      return confirmationResult;
    } catch (e: any) {
      console.error("Error sending OTP:", e);
      handleErrorUtility(e, "Failed to send OTP");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      if (user) {
        refetchUser();
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        router.push("/generate");
        router.refresh();
        toast({
          title: "Sign-In Successful",
          description: "Welcome!",
        });
      }
    } catch (e: any) {
      console.error("Error verifying OTP:", e);
      handleErrorUtility(e, "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return { sendOtp, verifyOtp, isLoading, error };
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (plan: PricingPlan) => {
      if (!firebaseUser) throw new Error("User not authenticated.");
      const token = await firebaseUser.getIdToken();
      return purchaseCreditsApi(plan, token);
    },
    onSuccess: (data, plan) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser!.uid) });
      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${plan.credits} credits. New balance: ${data.newBalance}.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Purchase Failed");
    },
  });
}
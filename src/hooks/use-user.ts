
// code explantion in docs/hooks/use-user.md

"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-keys";
import type { UserProfile, LoginCredentials } from '@/lib/types';
import type { PricingPlan } from '@/components/PricingCard';
import type { SignupCredentials } from "@/components/SignupForm";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  sendPasswordResetEmail,
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
  type UserListResponse,
} from "@/services/user-service";
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback, useEffect } from "react";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";

// --- API Service Functions ---

async function sendPasswordResetEmailApi(userId: string, token: string) {
  const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send password reset email.");
  }
  return response.json();
}

async function purchaseCreditsApi(
  plan: PricingPlan,
  token: string
): Promise<{ newBalance: number }> {
  const response = await fetch("/api/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId: plan.id, credits: plan.credits }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Purchase failed.");
  }
  return response.json();
}

// --- Custom Hooks ---
const USERS_PER_PAGE = 10;

export function useUsers() {
    const { firebaseUser } = useAuth();
    return useInfiniteQuery<UserListResponse>({
        queryKey: userKeys.lists(),
        queryFn: async ({ pageParam }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return fetchUsersApi(USERS_PER_PAGE, pageParam, token);
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.lastVisibleId;
        },
        enabled: !!firebaseUser
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
  return useQuery<UserProfile | null>({
    queryKey: userKeys.profile(userId),
    // Fallback fetch function for initial load or if the listener fails for some reason
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchUserProfileApi(userId, token);
    },
    staleTime: Infinity,
    enabled: !!userId && !!firebaseUser,
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
      // Specific UI error handling is now done within the LoginForm component
      // We still keep a general toast for unexpected errors
      if (!error.message.includes("Invalid email or password")) {
        handleErrorUtility(error, "Login Error");
      }
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
      router.push("/login");
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

export function useSignup() {
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
      // Error handling is now primarily managed in the SignupForm component
      // to set form-specific errors. A toast is still useful for general errors.
      if (error.error && !error.error._form) {
        // Do nothing if it's a field-specific error
      } else {
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
    mutationFn: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (error: any) {
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-email"
        ) {
          throw new Error("No user found with this email address.");
        }
        throw new Error(
          error.message || "Failed to send password reset email."
        );
      }
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox to reset your password.",
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
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(firebaseUser!.uid),
      });
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



// code explantion in docs/hooks/use-user.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-keys";
import type { UserProfile } from "@/lib/db/queries";
import type { PricingPlan } from "@/components/PricingCard";
import type { SignupCredentials } from "@/components/SignupForm";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { fetchUsers as fetchUsersApi, fetchUserProfile as fetchUserProfileApi, createUserService } from "@/services/user-service";
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback, useEffect } from "react";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";

export interface LoginCredentials {
  email: string;
  password: string;
}

// --- Query Functions ---

async function loginUser(credentials: LoginCredentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return userCredential.user;
  } catch (error: any) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || "Login failed. Please try again.");
  }
}

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message || "Google Sign-In failed.");
  }
}

async function logoutUser() {
  await signOut(auth);
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Logout failed.");
  }
  return response.json();
}

async function signupUser(credentials: SignupCredentials) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
}

async function sendPasswordResetEmailApi(userId: string, token: string) {
  const response = await fetch(`/api/users/${userId}/reset-password`, {
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

export function useUsers() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const token = await getAuthenticatedToken(firebaseUser);
            return fetchUsersApi(1, 10, token); // Default to page 1, limit 10
        },
        enabled: !!firebaseUser
    });
}

export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth(); // We need this to get the auth token
  return useQuery<UserProfile | null>({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await firebaseUser.getIdToken();
      return fetchUserProfileApi(userId, token);
    },
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
    enabled: !!userId && !!firebaseUser, // Only run if both userId and firebaseUser are available
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation({
    mutationFn: loginUser,
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
    mutationFn: signInWithGoogle,
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
    mutationFn: logoutUser,
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
    mutationFn: signupUser,
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


// src/services/api/userService.ts
// Unified client-side user management service
// All operations call API routes which handle db-helpers operations
'use client';

import type { UserProfile } from '@/lib/models/user';
import { apiService } from './apiService';
import { z } from 'zod';

// Validation schemas for user operations
const UserProfileUpdateSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  email: z.string().email().optional(),
}).strict();

const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['user', 'admin']).optional(),
  credits: z.number().nonnegative().optional(),
}).strict();

/**
 * Fetches a list of all administrators.
 * This is a public endpoint used to initiate support chats.
 * @returns A promise that resolves to an array of admin UserProfile objects.
 */
export async function fetchAdminsApi(): Promise<UserProfile[]> {
  return apiService({ endpoint: '/api/admins' });
}

export interface UserListResponse {
  users: UserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

/**
 * Fetches a paginated list of users from the API.
 * Requires admin authentication.
 */
export async function fetchUsersApi(limit: number, lastVisibleId: string | undefined, token: string): Promise<UserListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (lastVisibleId) {
    params.append('lastVisibleId', lastVisibleId);
  }
  return apiService({ endpoint: `/api/admin/users?${params.toString()}`, token });
}

/**
 * Fetches the current user's profile via API.
 * For real-time updates, use React Query or similar state management.
 * @param userId - User ID to fetch
 * @param token - Authentication token
 * @returns User profile or null if not found
 * 
 * Note: Replaced real-time subscriptions with API-based fetching
 * to maintain consistent API-first architecture
 */
export async function getUserProfileReal(userId: string, token: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    return await apiService({ endpoint: `/api/users/${userId}`, token });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetches the profile for a single user from the API.
 */
export async function fetchUserProfileApi(userId: string, token: string): Promise<UserProfile | null> {
  if (!userId) return null;
  return apiService({ endpoint: `/api/users/${userId}`, token });
}

/**
 * Creates a new user via the admin API with validation.
 * @param data - User data to create
 * @param token - Authentication token
 * @returns Created user profile
 * @throws Error if validation fails
 */
export async function createUserService(
  data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'hasCompletedOnboarding'> & { password?: string },
  token: string
): Promise<UserProfile> {
  try {
    // Validate input data
    const validatedData = UserCreateSchema.parse(data);
    
    return await apiService({
      endpoint: '/api/admin/users',
      method: 'POST',
      data: validatedData,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Updates an existing user's profile via the API with validation.
 * @param userId - User ID to update
 * @param data - Partial user data to update
 * @param token - Authentication token
 * @returns Updated user profile
 * @throws Error if validation fails
 */
export async function updateUserApi(
  userId: string,
  data: Partial<UserProfile>,
  token: string
): Promise<UserProfile> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Validate input data
    const validatedData = UserProfileUpdateSchema.parse(data);
    
    return await apiService({
      endpoint: `/api/users/${userId}`,
      method: 'PUT',
      data: validatedData,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Updates an existing user's profile via the ADMIN API with validation.
 * @param userId - User ID to update
 * @param data - Partial user data to update
 * @param token - Authentication token
 * @returns Updated user profile
 * @throws Error if validation fails
 */
export async function adminUpdateUserApi(
  userId: string,
  data: Partial<UserProfile>,
  token: string
): Promise<UserProfile> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Validate input data
    const validatedData = UserProfileUpdateSchema.parse(data);
    
    return await apiService({
      endpoint: `/api/admin/users/${userId}`,
      method: 'PUT',
      data: validatedData,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}


/**
 * Deletes a user via the admin API.
 */
export async function deleteUserApi(userId: string, token: string): Promise<{ message: string }> {
  return apiService({
    endpoint: `/api/admin/users/${userId}`,
    method: 'DELETE',
    token
  });
}

interface SendNotificationVariables {
  userId: string;
  title: string;
  body: string;
  link?: string;
}

/**
 * Sends a push notification to a specific user via the admin API.
 */
export async function sendNotificationApi(variables: SendNotificationVariables, token: string): Promise<{ messageId: string }> {
  return apiService({
    endpoint: '/api/admin/notifications/send',
    method: 'POST',
    data: variables,
    token
  });
}

// ============================================================================
// AUTHENTICATION OPERATIONS (consolidated from authService)
// ============================================================================

/**
 * Sends a password reset email API call.
 * @param userId - User ID to reset password for
 * @param token - Authentication token
 */
export async function sendPasswordResetEmailApi(userId: string, token: string) {
  return apiService({
    endpoint: `/api/users/${userId}/reset-password`,
    method: 'POST',
    token,
  });
}

/**
 * Creates or updates a user profile document via API with validation.
 * @param userId - User ID to update
 * @param data - Partial user profile data
 * @param token - Authentication token
 * @returns Updated user profile
 * @throws Error if validation fails
 */
export async function createOrUpdateUserProfileApi(
  userId: string,
  data: Partial<UserProfile>,
  token: string
): Promise<UserProfile> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Validate input data
    const validatedData = UserProfileUpdateSchema.parse(data);
    
    return await apiService({
      endpoint: `/api/users/${userId}`,
      method: 'PUT',
      data: validatedData,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

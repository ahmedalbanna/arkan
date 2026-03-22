
'use client';

import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import type { User as FirebaseUser } from 'firebase/auth';

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: T;
  token?: string; // Allow passing token directly
  firebaseUser?: FirebaseUser | null; // Or pass the user object
  headers?: Record<string, string>;
  isFormData?: boolean;
}

/**
 * A unified API service function to handle all client-server communication.
 * It automatically handles authentication, request body serialization, and response parsing.
 *
 * @param options - The configuration for the API request.
 * @returns A promise that resolves to the JSON response from the API.
 * @throws An ApiError if the request fails or the user is not authenticated when required.
 */
export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const {
    endpoint,
    method = 'GET',
    data,
    token: directToken,
    firebaseUser,
    headers = {},
    isFormData = false,
  } = options;

  let authToken = directToken;

  if (!authToken && firebaseUser) {
    authToken = await getAuthenticatedToken(firebaseUser);
  }

  const config: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (authToken) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${authToken}`,
    };
  }

  if (data) {
    if (isFormData) {
      // Don't set Content-Type for FormData, browser does it with boundary
      config.body = data as unknown as FormData;
    } else {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // If the response is not JSON, use the status text
      errorData = { message: response.statusText || 'An unknown error occurred.' };
    }
    throw new ApiError(errorData.message || response.statusText, response.status, errorData.details);
  }

  // Handle cases where the response might be empty (e.g., DELETE 204 No Content)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  // Return an empty object or a success indicator for non-JSON responses
  return {} as TResponse;
}

'use client';

import type { Session } from 'next-auth';

interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token?: string; // Allow passing token directly
  session?: Session | null; // NextAuth session
  headers?: Record<string, string>;
  isFormData?: boolean;
}

/**
 * A unified API service function to handle all client-server communication.
 * It automatically handles authentication, request body serialization, and response parsing.
 * Now uses NextAuth sessions for token management.
 *
 * @param options - The configuration for the API request.
 * @returns A promise that resolves to the JSON response from the API.
 * @throws An error if the request fails or the user is not authenticated when required.
 */
export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const {
    endpoint,
    method = 'GET',
    data,
    token: directToken,
    session,
    headers = {},
    isFormData = false,
  } = options;

  let authToken = directToken;

  // Extract token from NextAuth session if not provided directly
  if (!authToken && session?.user) {
    // NextAuth JWT tokens are managed server-side, we use the session ID
    // For client-side requests, we rely on NextAuth's built-in cookie handling
    authToken = session.user.id || '';
  }

  console.log(`[apiService] Preparing request:`, {
    method,
    endpoint,
    hasAuthToken: !!authToken,
    hasData: !!data,
    isFormData
  });

  const config: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (authToken) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${authToken}`,
    };
    console.log(`[apiService] Authorization header set for token:`, authToken.substring(0, 10) + '...');
  }

  if (data) {
    if (isFormData) {
      // Don't set Content-Type for FormData, browser does it with boundary
      config.body = data as unknown as FormData;
      console.log(`[apiService] FormData body set`);
    } else {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
      console.log(`[apiService] JSON body set:`, data);
    }
  }

  console.log(`[apiService] Fetching from endpoint:`, endpoint);
  const response = await fetch(endpoint, config);

  console.log(`[apiService] Response received:`, {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    console.error(`[apiService] Error response (${response.status}):`, response.statusText);
    let errorData;
    try {
      errorData = await response.json();
      console.error(`[apiService] Error data:`, errorData);
    } catch {
      // If the response is not JSON, use the status text
      errorData = { message: response.statusText || 'An unknown error occurred.' };
    }
    throw new Error(errorData.message);
  }

  // Handle cases where the response might be empty (e.g., DELETE 204 No Content)
  const contentType = response.headers.get('content-type');
  console.log(`[apiService] ${method} ${endpoint} - contentType:`, contentType);
  
  if (contentType && contentType.includes('application/json')) {
    const responseData = await response.json();
    console.log(`[apiService] Response data parsed:`, responseData);
    return responseData;
  }
  // Return an empty object or a success indicator for non-JSON responses
  console.warn(`[apiService] No JSON content-type. Returning empty object.`);
  return {} as TResponse;
}

'use client';

/**
 * ApiError — Specialized error vector for network and protocol failures.
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: T;
  token?: string; 
  headers?: Record<string, string>;
  isFormData?: boolean;
  responseType?: 'json' | 'blob' | 'text';
  signal?: AbortSignal;
}

/**
 * apiService — A unified high-fidelity transmission vector for client-server communication.
 * Standardizes authentication, serialization, and robust error containment.
 *
 * DEFENSIVE MEASURES:
 * 1. Strict Typing: Removes 'any' defaults to enforce explicit data contracts.
 * 2. Payload Validation: Guarded JSON serialization and body mapping.
 * 3. Error Purity: Exhaustive parsing of non-JSON error responses.
 * 4. Response Safeguards: Handles empty 204 contents and varied content-types gracefully.
 */
export async function apiService<TRequest = unknown, TResponse = unknown>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const {
    endpoint,
    method = 'GET',
    data,
    token: directToken,
    headers = {},
    isFormData = false,
    responseType = 'json',
    signal,
  } = options;

  const config: RequestInit = {
    method,
    headers: { ...headers },
    signal,
  };

  // 1. AUTHENTICATION INJECTION
  if (directToken) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${directToken}`,
    };
  }

  // 2. PAYLOAD SYNTHESIS
  if (data) {
    if (isFormData) {
      config.body = data as unknown as FormData;
    } else {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
      try {
        config.body = JSON.stringify(data);
      } catch (e) {
        throw new ApiError('Failed to serialize transmission payload.', 400, e);
      }
    }
  }

  // 3. EXECUTION & CONTAINMENT
  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      let errorData: any;
      try {
        const text = await response.text();
        try {
            errorData = JSON.parse(text);
        } catch {
            errorData = { message: text || response.statusText || 'Neural link failed.' };
        }
      } catch {
        errorData = { message: 'The remote endpoint returned an unreadable manifest.' };
      }
      throw new ApiError(errorData.message || 'System error encountered.', response.status, errorData.details);
    }

    // 4. RESPONSE MATERIALIZATION
    if (responseType === 'blob') {
      return (await response.blob()) as TResponse;
    }

    if (responseType === 'text') {
      return (await response.text()) as TResponse;
    }

    if (response.status === 204) {
        return {} as TResponse;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as TResponse;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    // Handle network-level failures (CORS, Timeout, Offline)
    console.error('[ApiService] Transmission aborted:', error);
    throw new ApiError(
        error instanceof Error ? error.message : 'The neural transmission was interrupted.', 
        0
    );
  }
}

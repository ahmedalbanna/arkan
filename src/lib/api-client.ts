
import { getAuth } from 'firebase/auth';

class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * A wrapper around the native `fetch` function that automatically adds the
 * Firebase authentication token to the request headers.
 *
 * This function should be used for all API calls to protected server-side endpoints.
 *
 * @param url The URL to fetch.
 * @param options The options for the fetch request (e.g., method, body, headers).
 * @returns A Promise that resolves to the parsed JSON response.
 * @throws {ApiError} If the user is not authenticated or if the network request fails.
 */
export async function authenticatedFetch<T>(url: string | URL, options: RequestInit = {}): Promise<T> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        console.error('authenticatedFetch error: User is not authenticated.');
        throw new ApiError('User not authenticated.', 401);
    }

    try {
        const token = await user.getIdToken(true); // Force refresh the token

        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || errorMessage;
            } catch (e) {
                // Ignore if response body is not JSON
            }
            console.error(`API Error on ${url}:`, errorMessage);
            throw new ApiError(errorMessage, response.status);
        }

        // Handle cases where the response body might be empty (e.g., for a 204 No Content status)
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw custom API errors
        }
        console.error('authenticatedFetch failed:', error);
        throw new ApiError(error.message || 'An unexpected error occurred.', 500);
    }
}

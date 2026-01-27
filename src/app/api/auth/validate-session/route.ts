import { validateAuthState } from '@/lib/firebase/auth-helpers';
import { handleApiError, createApiResponse } from '@/lib/utils/api-utils';

/**
 * API endpoint to validate session cookie on the server
 * Used by AuthContext to restore auth state
 */
export async function POST(request: Request) {
  try {
    const { sessionCookie } = await request.json();
    
    if (!sessionCookie) {
      return createApiResponse({ authenticated: false }, 200);
    }

    const authData = await validateAuthState(sessionCookie);
    
    if (authData) {
      return createApiResponse({
        authenticated: true,
        uid: authData.uid,
        email: authData.email,
      }, 200);
    } else {
      return createApiResponse({ authenticated: false }, 200);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

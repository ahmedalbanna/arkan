/**
 * Session management utilities for handling authentication sessions and cookies.
 */

import { apiService } from '@/infrastructure/api/ApiService';

/**
 * Manages setting/clearing the session cookie based on authentication state.
 * @param user The authenticated Firebase user, or null to clear session
 */
import { injectable } from 'tsyringe';
import { ISessionService } from '../../domain/services/ISessionService';

@injectable()
export class SessionManager implements ISessionService {
  async manageSession(
    user: any | null,
  ): Promise<void> {
    if (user) {
      // Session is already created by login/signup routes via cookie
      return;
    }

    await apiService<undefined, void>({
      endpoint: '/api/auth/logout',
      method: 'POST',
    });
  }
}

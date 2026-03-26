/**
 * Cookie management utilities for handling authentication and guest cookies.
 */

const GUEST_COOKIE_NAME = '__guest';
const GUEST_COOKIE_VALUE = 'true';

/**
 * Checks if a guest cookie exists in the browser.
 * @returns True if guest cookie is found, false otherwise
 */
import { injectable } from 'tsyringe';
import { ICookieService } from '../../domain/services/ICookieService';

@injectable()
export class CookieManager implements ICookieService {
  hasGuestCookie(): boolean {
    if (typeof window === 'undefined') return false;
    return document.cookie.includes(`${GUEST_COOKIE_NAME}=true`);
  }

  clearGuestCookie(): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${GUEST_COOKIE_NAME}=; Max-Age=-99999999; path=/;`;
  }

  setGuestCookie(): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${GUEST_COOKIE_NAME}=${GUEST_COOKIE_VALUE}; path=/;`;
  }

  clearAuthCookies(): void {
    this.clearGuestCookie();
  }
}

/**
 * Cookie management utilities for handling authentication and guest cookies.
 */

const GUEST_COOKIE_NAME = '__guest';
const GUEST_COOKIE_VALUE = 'true';

/**
 * Checks if a guest cookie exists in the browser.
 * @returns True if guest cookie is found, false otherwise
 */
export function hasGuestCookie(): boolean {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes(`${GUEST_COOKIE_NAME}=true`);
}

/**
 * Clears the guest cookie from the browser.
 */
export function clearGuestCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${GUEST_COOKIE_NAME}=; Max-Age=-99999999; path=/;`;
}

/**
 * Sets the guest cookie in the browser.
 */
export function setGuestCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${GUEST_COOKIE_NAME}=${GUEST_COOKIE_VALUE}; path=/;`;
}

/**
 * Clears all authentication-related cookies.
 */
export function clearAuthCookies(): void {
  clearGuestCookie();
  // Add any other auth-related cookie clearing logic here
}

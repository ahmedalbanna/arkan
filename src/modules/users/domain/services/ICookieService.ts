export interface ICookieService {
    hasGuestCookie(): boolean;
    clearGuestCookie(): void;
    setGuestCookie(): void;
    clearAuthCookies(): void;
}

export const ICookieServiceToken = Symbol("ICookieService");

export interface ITwoFactorAuthService {
  generateSecret(): string;
  generateQrCode(email: string, secret: string): Promise<string>;
  verifyToken(token: string, secret: string): boolean;
}

export const ITwoFactorAuthServiceToken = Symbol('ITwoFactorAuthService');


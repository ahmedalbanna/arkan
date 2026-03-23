import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'arkan-default-secret-change-me-in-production'
);

const ALG = 'HS256';

export class AuthCrypto {
  /**
   * Hashes a plain text password.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password with a hash.
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a signed JWT.
   */
  static async createToken(payload: { uid: string; email?: string; version?: number }, expiresIn: string | number = '7d'): Promise<string> {
    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET);
  }

  /**
   * Verifies and decodes a JWT.
   */
  static async verifyToken(token: string): Promise<{ uid: string; email?: string; version?: number } | null> {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        algorithms: [ALG],
      });
      return payload as { uid: string; email?: string; version?: number };
    } catch (error) {
      return null;
    }
  }
}

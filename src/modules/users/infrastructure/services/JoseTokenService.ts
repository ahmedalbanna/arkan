import { injectable } from 'tsyringe';
import * as jose from 'jose';
import { ITokenService } from '../../domain/services/ITokenService';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'arkan-default-secret-change-me-in-production'
);

const ALG = 'HS256';

@injectable()
export class JoseTokenService implements ITokenService {
    async create(payload: any, expiresIn: string | number = '7d'): Promise<string> {
        return new jose.SignJWT(payload)
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(JWT_SECRET);
    }

    async verify<T>(token: string): Promise<T | null> {
        try {
            const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
                algorithms: [ALG],
            });
            return payload as unknown as T;
        } catch (error) {
            return null;
        }
    }
}

export interface ITokenService {
    create(payload: any, expiresIn?: string | number): Promise<string>;
    verify<T>(token: string): Promise<T | null>;
}

export const ITokenServiceToken = Symbol("ITokenService");

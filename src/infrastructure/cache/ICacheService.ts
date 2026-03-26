export interface ICacheService {
    get<T>(key: string): T | null;
    set<T>(key: string, data: T): void;
    invalidate(key: string): void;
}

export const ICacheServiceToken = Symbol("ICacheService");

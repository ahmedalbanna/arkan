/**
 * Simple in-memory rate limiter for a single-instance server.
 * In a multi-instance/serverless environment, Redis would be preferred.
 */
class RateLimiter {
    private stores: Map<string, Map<string, { count: number, resetAt: number }>> = new Map();

    /**
     * @param key - Unique key for the rate limit (e.g., 'login', 'forgot-password')
     * @param identifier - Unique identifier for the client (e.g., IP address)
     * @param limit - Max number of requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns { boolean } - True if request is allowed, False if rate limited
     */
    async check(key: string, identifier: string, limit: number, windowMs: number): Promise<{ allowed: boolean, remaining: number, resetAt: number }> {
        if (!this.stores.has(key)) {
            this.stores.set(key, new Map());
        }

        const store = this.stores.get(key)!;
        const now = Date.now();
        const record = store.get(identifier);

        if (!record || now > record.resetAt) {
            const newRecord = { count: 1, resetAt: now + windowMs };
            store.set(identifier, newRecord);
            return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt };
        }

        if (record.count >= limit) {
            return { allowed: false, remaining: 0, resetAt: record.resetAt };
        }

        record.count += 1;
        return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
    }

    /**
     * Gets current rate limit stats without incrementing the counter.
     */
    async getStats(key: string, identifier: string, limit: number, windowMs: number): Promise<{ remaining: number, resetAt: number }> {
        if (!this.stores.has(key)) {
            return { remaining: limit, resetAt: Date.now() + windowMs };
        }

        const store = this.stores.get(key)!;
        const now = Date.now();
        const record = store.get(identifier);

        if (!record || now > record.resetAt) {
            return { remaining: limit, resetAt: now + windowMs };
        }

        return { remaining: Math.max(0, limit - record.count), resetAt: record.resetAt };
    }
}

/**
 * Global Singleton Pattern for RateLimiter
 * Prevents store resets during Next.js hot reloads.
 */
const globalForLimiter = globalThis as unknown as {
    rateLimiter: RateLimiter | undefined;
};

export const rateLimiter = globalForLimiter.rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== 'production') {
    globalForLimiter.rateLimiter = rateLimiter;
}

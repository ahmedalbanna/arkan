
/**
 * Next.js Instrumentation file.
 * This runs before any route handler on the server.
 * We use it to ensure reflect-metadata is loaded for tsyringe DI.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('reflect-metadata');
        // Pre-initialize the DI container to register all dependencies
        await import('@/infrastructure/di/container');
    }
}

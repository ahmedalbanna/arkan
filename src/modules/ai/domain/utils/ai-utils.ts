/**
 * A simple retry utility with exponential backoff and jitter.
 * Handles transient errors like rate limits (429), server errors (5xx), and network failures.
 * @param fn The async function to execute.
 * @param retries The maximum number of retries.
 * @param delay The initial delay in milliseconds.
 * @returns A promise that resolves with the result of the function.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.error(`Attempt ${i + 1}/${retries} failed. Error:`, error);
      lastError = error;

      if (i === retries - 1) {
        break; // Don't wait on the last attempt
      }

      let retryDelay = delay * Math.pow(2, i);
      const jitter = Math.random() * 1000; // Add jitter to avoid thundering herd problem

      // Check if it's a rate limit error (status 429)
      if (error.status === 429) {
        // Use the suggested retry delay from the API if available, otherwise use exponential backoff.
        retryDelay = (error.errorDetails?.[2]?.retryDelay?.seconds * 1000) || retryDelay;
        console.warn(`Rate limit exceeded. Retrying in ${((retryDelay + jitter) / 1000).toFixed(2)}s... (Attempt ${i + 1}/${retries})`);
      } else if (error.message?.includes('fetch failed') || error.status >= 500) {
        // Retry on generic network errors or server-side errors
        console.warn(`Network/Server error detected. Retrying in ${((retryDelay + jitter) / 1000).toFixed(2)}s... (Attempt ${i + 1}/${retries})`);
      } else {
        // Not a retryable error (e.g., 400, 401, 403), throw immediately.
        throw lastError;
      }
      await new Promise(res => setTimeout(res, retryDelay + jitter));
    }
  }
  throw lastError;
}

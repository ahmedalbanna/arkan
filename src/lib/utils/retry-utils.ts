/**
 * Retry utility functions with exponential backoff
 */

import { RetryConfig, GenerationAttempt } from '@/types';
import { logger } from './logger';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(
  attemptNumber: number,
  config: RetryConfig
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors - retryable
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('econnrefused') ||
        message.includes('econnreset')) {
      return true;
    }
    
    // Rate limiting - retryable
    if (message.includes('rate limit') || 
        message.includes('too many requests')) {
      return true;
    }
    
    // Service unavailable - retryable
    if (message.includes('503') || 
        message.includes('service unavailable')) {
      return true;
    }
    
    // Model loading - retryable (Ollama specific)
    if (message.includes('model is loading')) {
      return true;
    }
  }
  
  // Validation errors, auth errors - NOT retryable
  return false;
}

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @param context - Context for logging (e.g., section ID)
 * @returns The result of the function or throws after all retries exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context?: string
): Promise<T> {
  const attempts: GenerationAttempt[] = [];
  let lastError: unknown;

  for (let attemptNumber = 1; attemptNumber <= config.maxAttempts; attemptNumber++) {
    const attempt: GenerationAttempt = {
      attemptNumber,
      model: context || 'unknown',
      startTime: Date.now(),
      success: false,
    };

    try {
      logger.info(`Attempt ${attemptNumber}/${config.maxAttempts}${context ? ` for ${context}` : ''}`);
      
      const result = await fn();
      
      attempt.success = true;
      attempt.endTime = Date.now();
      attempts.push(attempt);
      
      if (attemptNumber > 1) {
        logger.info(`✓ Succeeded on attempt ${attemptNumber} after ${attempt.endTime - attempt.startTime}ms`);
      }
      
      return result;
      
    } catch (error) {
      attempt.success = false;
      attempt.endTime = Date.now();
      attempt.error = error instanceof Error ? error.message : String(error);
      attempts.push(attempt);
      
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        logger.error(`✗ Non-retryable error on attempt ${attemptNumber}: ${attempt.error}`);
        throw error;
      }
      
      // If this was the last attempt, don't wait
      if (attemptNumber === config.maxAttempts) {
        logger.error(`✗ All ${config.maxAttempts} attempts failed`);
        break;
      }
      
      // Calculate backoff delay and wait
      const delay = calculateBackoffDelay(attemptNumber, config);
      logger.warn(`✗ Attempt ${attemptNumber} failed: ${attempt.error}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All attempts failed
  const totalTime = attempts.reduce((sum, a) => sum + ((a.endTime || 0) - a.startTime), 0);
  logger.error(`Failed after ${attempts.length} attempts (total time: ${totalTime}ms)`);
  
  throw lastError;
}

/**
 * Execute multiple functions with retry logic in parallel
 * Returns partial results - some may succeed while others fail
 */
export async function withRetryParallel<T>(
  fns: Array<() => Promise<T>>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  contexts?: string[]
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const promises = fns.map((fn, index) => 
    withRetry(fn, config, contexts?.[index])
      .then(result => ({ success: true as const, result }))
      .catch(error => ({ 
        success: false as const, 
        error: error instanceof Error ? error : new Error(String(error)) 
      }))
  );
  
  return Promise.all(promises);
}

import { toast } from "@/hooks/use-toast";

/**
 * A centralized utility for handling and displaying errors.
 * It shows a consistent toast notification for any error caught in the application.
 *
 * @param error - The error object, which can be of any type.
 * @param context - An optional string to provide context for the error message title (e.g., "Login Failed").
 */
export const handleErrorUtility = (error: any, context?: string) => {
  let title = context || 'Error';
  let description = 'An unexpected error occurred. Please try again.';

  if (error && error.message) {
    // Standard JavaScript Error object
    description = error.message;
  } else if (error && error.error && error.error._form && error.error._form[0]) {
    // Zod error from a form action
    description = error.error._form[0];
  } else if (typeof error === 'string') {
    // Plain string error
    description = error;
  }

  toast({
    title,
    description,
    variant: 'destructive',
  });
};

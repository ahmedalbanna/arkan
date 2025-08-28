
'use client';

import { toast } from "@/hooks";

/**
 * A centralized utility for handling and displaying errors.
 * It shows a consistent toast notification for any error caught in the application.
 *
 * @param error - The error object, which can be of any type.
 * @param context - An optional string to provide context for the error message title (e.g., "Login Failed").
 */
export const handleErrorUtility = (error: any, context?: string) => {
  let title = context || 'An Error Occurred';
  let description = 'An unexpected error occurred. Please try again.';

  if (error && error.message) {
    // For standard JavaScript Error objects
    description = error.message;
  } else if (error && typeof error === 'object' && error.error) {
    // For structured errors from form actions or APIs
    const formError = error.error._form;
    if (formError && Array.isArray(formError) && formError.length > 0) {
      description = formError.join(', ');
    } else if (error.message) {
        description = error.message;
    }
  } else if (typeof error === 'string') {
    // For plain string errors
    description = error;
  }

  // Set a more specific title based on known error messages
  if (description.toLowerCase().includes('credit')) {
    title = "Insufficient Credits";
  } else if (description.toLowerCase().includes('auth') || description.toLowerCase().includes('unauthorized')) {
    title = "Authentication Error";
  } else if (description.toLowerCase().includes('not found')) {
      title = "Not Found"
  }

  toast({
    title,
    description,
    variant: 'destructive',
  });
};


'use client';

import { toast } from "@/hooks";
import { Telemetry } from "./telemetry";

/**
 * A centralized utility for handling and displaying client-side errors.
 * It shows a consistent toast notification for any error caught in UI event handlers or mutations.
 *
 * @param error - The error object, which can be of any type.
 * @param context - An optional string to provide a default error title (e.g., "Login Failed").
 */
export const handleErrorUtility = (error: any, context?: string) => {
  let title = context || 'An Error Occurred';
  let description = 'An unexpected error occurred. Please try again.';

  // Check for a structured error response from our API
  if (error && typeof error === 'object' && error.message) {
    description = error.message;
    
    // Support validation details
    if (error.details && Array.isArray(error.details)) {
        const details = error.details.map((d: any) => d.message || d).join(', ');
        description = `${error.message}: ${details}`;
    } else if (error.details && typeof error.details === 'object') {
        description = `${error.message} (${JSON.stringify(error.details)})`;
    }

    if (error.code || error.status) { 
        title = context || 'Request Failed';
    }
  } else if (typeof error === 'string') {
    description = error;
  }

  // Set a more specific title based on known error messages
  if (description.toLowerCase().includes('credit')) {
    title = "Insufficient Credits";
  } else if (description.toLowerCase().includes('auth') || description.toLowerCase().includes('unauthorized') || description.toLowerCase().includes('password')) {
    title = "Authentication Error";
  } else if (description.toLowerCase().includes('not found')) {
      title = "Not Found"
  }

  // Log to telemetry
  Telemetry.logFailure('ClientUI', { title, description, originalError: error });

  toast({
    title,
    description,
    variant: 'destructive',
  });
};

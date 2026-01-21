
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string to prevent XSS attacks.
 * It allows safe HTML tags commonly found in rich text editors and markdown.
 * @param dirty The potentially unsafe string.
 * @returns The sanitized string.
 */
export function sanitize(dirty: string): string {
  // Configure DOMPurify to allow a safe set of HTML tags and attributes
  // This is a basic configuration and can be extended based on requirements.
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true }, // Allows common HTML tags like p, br, b, i, em, strong, etc.
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'], // Explicitly forbid dangerous tags
    FORBID_ATTR: ['onerror', 'onload', 'onclick'], // Forbid dangerous event handler attributes
  });
  return clean;
}

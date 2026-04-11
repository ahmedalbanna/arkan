
// import DOMPurify from 'isomorphic-dompurify';

// /**
//  * Sanitizes a string to prevent XSS attacks.
//  * It allows safe HTML tags commonly found in rich text editors and markdown.
//  * @param dirty The potentially unsafe string.
//  * @returns The sanitized string.
//  */
// export function sanitize(dirty: string): string {
//   // Configure DOMPurify to allow a safe set of HTML tags and attributes
//   const clean = DOMPurify.sanitize(dirty, {
//     USE_PROFILES: { html: true },
//     FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
//     FORBID_ATTR: ['onerror', 'onload', 'onclick'],
//   });
//   return clean;
// }

/**
 * Strips common AI conversational filler and markdown artifacts from model output.
 * Ensures the result is a clean, substantive text payload.
 */
export function cleanAiOutput(content: string): string {
  if (!content) return '';

  return content
    // Remove conversational preambles (e.g., "Here is the section:", "Certainly! Here is...")
    .replace(/^(Certainly!|Sure!|Here is|Below is|Based on|Okay,).+?:/i, '')
    // Remove common markdown artifacts from the start/end
    .replace(/^```(markdown|text)?\n/i, '')
    .replace(/\n```$/i, '')
    // Trim whitespace
    .trim();
}

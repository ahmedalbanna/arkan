/**
 * Shared motion constants for the builder workspace.
 * Standardizes easing and duration across all layout transitions.
 */

export const SPRING_EASE = [0.22, 1, 0.36, 1] as const;

export const PANEL_TRANSITION = {
  duration: 0.5,
  ease: SPRING_EASE,
} as const;

export const SECTION_TRANSITION = {
  duration: 0.3,
  ease: SPRING_EASE,
} as const;

export const FADE_TRANSITION = {
  duration: 0.4,
  ease: SPRING_EASE,
} as const;

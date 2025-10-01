/**
 * Accessibility configuration.
 *
 * UI constants for touch targets and focus styles.
 * Helps ensure compliance with accessibility guidelines (WCAG).
 */
export const accessibilityConfig = {
	/** Minimum recommended touch target size (in pixels). */
    minTouchTarget: 44,

	/** Default focus outline width (in pixels). */
    focusOutlineWidth: 2,
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type AccessibilityConfig = typeof accessibilityConfig;
/**
 * Navigation configuration.
 *
 * Centralizes application-level navigation behavior and URL parameter handling.
 * This configuration is primarily used to determine how navigation affects pagination
 * and which query parameters should be ignored per route.
 */
export const navigationConfig = {
    /**
     * Whether to reset pagination to the first page upon navigation.
     *
     * @default true
     */
    resetPageOnNavigate: true as boolean,

    /**
     * URL parameters to ignore for specific routes.
     *
     * Each key represents a route path, and its value is an array
     * of query parameter names that should be removed or ignored
     * during navigation or state persistence.
     */
    ignoredParams: {
        "/artists": ["search"],
        "/events": ["search"],
        "/": ["page", "size", "search"],
    },
} as const;

/**
 * Type alias for the navigation configuration.
 *
 * Useful for dependency injection, unit testing, or when typing
 * functions that consume navigation behavior rules.
 */
export type NavigationConfig = typeof navigationConfig;
import type { NavigationConfig } from "../config/navigation.config";

/**
 * @displayName INavigationStrategy
 * @public
 *
 * Defines the interface for URL transformation strategies.
 *
 * Each strategy encapsulates a single, reusable navigation rule
 * applied to query parameters when building new URLs.
 */
export interface INavigationStrategy {
    /**
     * Applies the strategy logic to modify or filter query parameters.
     *
     * @param searchParams - The current query parameters.
     * @param currentPath - The current route path.
     * @param targetPath - The path of the next navigation target.
     * @param config - The global navigation configuration.
     * @returns A new {@link URLSearchParams} instance with the applied rule.
     */
    applyTo(
        searchParams: URLSearchParams,
        currentPath: string,
        targetPath: string,
        config: NavigationConfig
    ): URLSearchParams;
}
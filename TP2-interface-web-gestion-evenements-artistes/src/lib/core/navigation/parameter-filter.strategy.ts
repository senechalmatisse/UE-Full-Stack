import type { NavigationConfig } from "../config/navigation.config";
import type { INavigationStrategy } from "./navigation.strategy.interface";

/**
 * @displayName ParameterFilterStrategy
 * @public
 *
 * Strategy: Removes query parameters that are irrelevant to the target route.
 *
 * For example, when navigating from a search page to a product page,
 * filters out parameters like `category` or `filter`.
 */
export class ParameterFilterStrategy implements INavigationStrategy {
    /**
     * Removes ignored parameters for the target route.
     *
     * @param searchParams - The current query parameters.
     * @param _currentPath - Unused current path.
     * @param targetPath - The target route key.
     * @param config - Navigation configuration containing ignored parameters per route.
     * @returns A filtered {@link URLSearchParams} instance.
     */
    applyTo(
        searchParams: URLSearchParams,
        _currentPath: string,
        targetPath: keyof NavigationConfig["ignoredParams"],
        config: NavigationConfig
    ): URLSearchParams {
        const params = new URLSearchParams(searchParams);
        const ignoredForRoute = config.ignoredParams[targetPath] ?? [];

        ignoredForRoute.forEach(param => params.delete(param));
        return params;
    }
}
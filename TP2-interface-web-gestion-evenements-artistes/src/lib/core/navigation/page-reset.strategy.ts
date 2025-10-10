import type { NavigationConfig } from "../config/navigation.config";
import type { INavigationStrategy } from "./navigation.strategy.interface";

/**
 * @displayName PageResetStrategy
 * @public
 *
 * Strategy: Resets the "page" query parameter when navigating
 * to a different route. Ensures users always start from the first page.
 */
export class PageResetStrategy implements INavigationStrategy {
    /**
     * Applies the "page reset" rule when the route changes.
     *
     * @param searchParams - Current query parameters.
     * @param currentPath - Current route path.
     * @param targetPath - Target route path.
     * @param config - Navigation configuration containing reset flags.
     * @returns Updated {@link URLSearchParams} with page reset if applicable.
     */
    applyTo(
        searchParams: URLSearchParams,
        currentPath: string,
        targetPath: string,
        config: NavigationConfig
    ): URLSearchParams {
        const params = new URLSearchParams(searchParams);

        if (config.resetPageOnNavigate && currentPath !== targetPath) {
            params.set('page', '1');
        }

        return params;
    }
}
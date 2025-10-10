import type { INavigationStrategy } from './navigation.strategy.interface';
import { getAppConfig } from "../config"
import { PageResetStrategy } from './page-reset.strategy';
import { ParameterFilterStrategy } from './parameter-filter.strategy';

/**
 * @displayName NavigationUrlBuilder
 * @public
 *
 * Builds navigation URLs by applying a set of modular strategies.
 *
 * This class combines multiple navigation strategies (e.g., query filtering,
 * pagination reset) to generate a consistent and predictable URL.
 */
export class NavigationUrlBuilder {
    private strategies: INavigationStrategy[];
    private config = getAppConfig().navigation;

    /**
     * Creates a new instance of {@link NavigationUrlBuilder}.
     *
     * @param strategies - Optional list of navigation strategies to apply.
     * If omitted, defaults to {@link PageResetStrategy} and {@link ParameterFilterStrategy}.
     */
    constructor(strategies?: INavigationStrategy[]) {
        this.strategies = strategies ?? [
            new PageResetStrategy(),
            new ParameterFilterStrategy()
        ];
    }

    /**
     * Builds a navigable href string using the configured strategies.
     *
     * @param targetPath - The desired route path.
     * @param currentUrl - The current URL context.
     * @returns A formatted URL string containing the processed query parameters.
     */
    build(targetPath: string, currentUrl: URL): string {
        if (targetPath === "/") return "/";

        let searchParams = new URLSearchParams(currentUrl.searchParams);
        const currentPath = currentUrl.pathname as keyof typeof this.config.ignoredParams;

        this.strategies.forEach(strategy => {
            const result = strategy.applyTo(searchParams, currentPath, targetPath, this.config);
            if (result instanceof URLSearchParams) searchParams = result;
        });

        const query = searchParams.toString();
        return query ? `${targetPath}?${query}` : targetPath;
    }
}
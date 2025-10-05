import { page } from '$app/stores';
import { get } from 'svelte/store';
import { NavigationUrlBuilder } from '$lib/core';

/**
 * Composable for building navigation URLs in SvelteKit.
 *
 * Uses the Strategy pattern for configurable URL building logic.
 */
let urlBuilder: NavigationUrlBuilder | null = null;

/**
 * Composable for managing URL navigation logic.
 *
 * Implements the Strategy design pattern to keep navigation extensible and decoupled.
 * Provides a simple interface for generating route URLs based on the current page context.
 *
 * @example
 * ```ts
 * const { buildHref } = useNavigation();
 * const link = buildHref('/events');
 * ```
 */
export function useNavigation() {
    // Lazy initialization of the URL builder
    if (!urlBuilder) {
        urlBuilder = new NavigationUrlBuilder();
    }

    /**
     * Builds a new navigation URL based on the current route and target path.
     *
     * @param targetPath - The target path (e.g., "/artists", "/events").
     * @returns A fully constructed href string.
     */
    function buildHref(targetPath: string): string {
        const currentUrl = get(page).url;
        return urlBuilder!.build(targetPath, currentUrl);
    }

    return { buildHref };
}
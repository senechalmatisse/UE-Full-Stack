import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { 
    ConfigErrorResolver,
    getAppConfig,
    LoadingStateManager
} from '$lib/core';
import { notifications } from '$lib/stores/notification.store';

/**
 * Configuration options for {@link usePaginationNavigation}.
 */
export interface PaginationNavigationOptions {
    /** Entity type used for navigation (e.g., `"artists"` or `"events"`). */
	entity: string;

    /** Default number of items per page (default: `10`). */
	defaultSize?: number;

    /** Enables search query parameter support when `true`. */
	withSearch?: boolean;
}

/**
 * Composable hook for handling pagination navigation in SvelteKit.
 *
 * Centralizes logic for:
 * - Page navigation with `goto`
 * - Managing loading and error states
 * - Supporting optional search parameters
 *
 * @param options - Pagination navigation configuration.
 * @returns Utilities for managing pagination navigation.
 */
export function usePaginationNavigation(options: PaginationNavigationOptions) {
	const APP_CONFIG = getAppConfig();
	const {
		entity,
		defaultSize = APP_CONFIG.pagination.defaultSize,
		withSearch = false
	} = options;

	const loadingManager = new LoadingStateManager(new ConfigErrorResolver());
	let currentLoadingState = loadingManager.getState();

    /**
     * Subscribes to changes in the loading state.
     *
     * @param callback - Function invoked whenever the state changes.
     * @returns A cleanup function to unsubscribe.
     */
	function subscribeToLoading(
		callback: (state: typeof currentLoadingState) => void
	): () => void {
		return loadingManager.subscribe(callback);
	}

    /**
     * Navigates to a specific page and manages loading and error states.
     *
     * @param pageNumber - The page number to navigate to.
     * @param searchQuery - Optional search query (applied only if `withSearch` is enabled).
     */
	async function navigateToPage(
        pageNumber: number,
        searchQuery?: string
    ): Promise<void> {
		loadingManager.startLoading();

		try {
			const currentSize =
				get(page).url.searchParams.get('size') || String(defaultSize);

			let url = `/${entity}?page=${pageNumber}&size=${currentSize}`;
			if (withSearch && searchQuery) {
				const encoded = encodeURIComponent(searchQuery);
				url += `&search=${encoded}`;
			}

			await goto(url);
		} catch (err) {
			notifications.error(`Une erreur est survenue lors de la navigation vers ${entity}.`);
            loadingManager.setError(500); 
		} finally {
			loadingManager.stopLoading();
		}
	}

	return {
		/** Internal loading state manager instance (provides full control over loading/error states). */
		loadingManager,

		/** Current snapshot of the loading state (read-only). */
		get state() {
			return currentLoadingState;
		},

		/** Subscribe to loading state changes. */
		subscribeToLoading,

		/** Navigate to a specific page, optionally including a search query. */
		navigateToPage,

		/** Reset the loading state to its initial value. */
		resetLoadingState: () => loadingManager.reset()
	};
}
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { LoadingStateManager } from '$lib/utils/formatters';
import { notifications } from '$lib/stores/notification.store';

/**
 * Configuration options for pagination navigation.
 */
export interface PaginationNavigationOptions {
	/** Entity type used for navigation (e.g., `"artists"` or `"events"`). */
	entity: string;

	/** Default number of items per page (defaults to 10 if not provided). */
	defaultSize?: number;

	/** Whether search query support is enabled (adds `search` parameter to query string). */
	withSearch?: boolean;
}

/**
 * Composable hook for handling pagination navigation in SvelteKit.
 *
 * This hook centralizes logic for:
 * - Navigating between pages with `goto`.
 * - Managing loading and error states.
 * - Handling optional search queries.
 *
 * @param options - Pagination navigation options (see {@link PaginationNavigationOptions}).
 * @returns An object with utilities for pagination navigation:
 * - `loadingManager`: Internal loading state manager instance.
 * - `state`: Current loading state snapshot.
 * - `subscribeToLoading`: Subscribe to loading state updates.
 * - `navigateToPage`: Navigate to a specific page (with optional search term).
 * - `resetLoadingState`: Reset the loading state manager.
 *
 * @example
 * ```ts
 * const {
 *   navigateToPage,
 *   subscribeToLoading,
 *   resetLoadingState,
 *   state
 * } = usePaginationNavigation({
 *   entity: 'artists',
 *   defaultSize: 20,
 *   withSearch: true
 * });
 *
 * // Navigate to page 2 with a search term
 * await navigateToPage(2, 'Beatles');
 *
 * // Subscribe to loading state changes
 * const unsubscribe = subscribeToLoading((state) => {
 *   console.log('Loading state:', state);
 * });
 * ```
 */
export function usePaginationNavigation(options: PaginationNavigationOptions) {
	const { entity, defaultSize = 10, withSearch = false } = options;

	const loadingManager = new LoadingStateManager();
	let currentLoadingState = loadingManager.getState();

	/**
	 * Subscribes to changes in the loading state.
	 *
	 * @param callback - A function that receives the new loading state whenever it changes.
	 * @returns A cleanup function to unsubscribe from updates.
	 */
	function subscribeToLoading(
		callback: (state: typeof currentLoadingState) => void
	): () => void {
		return loadingManager.subscribe(callback);
	}

	/**
	 * Navigates to a specific page while handling loading and error states.
	 *
	 * Automatically appends query parameters for `page`, `size`, and optionally `search`.
	 *
	 * @async
	 * @param pageNumber - The target page number.
	 * @param searchQuery - Optional search term (only applied if `withSearch` is enabled).
	 *
	 * @example
	 * ```ts
	 * await navigateToPage(3); // navigates to ?page=3&size=10
	 * await navigateToPage(1, 'rock'); // navigates to ?page=1&size=10&search=rock
	 * ```
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
			loadingManager.setError(
				err instanceof Error ? err.message : 'Erreur inconnue'
			);
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
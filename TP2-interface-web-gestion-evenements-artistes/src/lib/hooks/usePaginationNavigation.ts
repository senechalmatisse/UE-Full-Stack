import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { LoadingStateManager } from '../utils/formatters';
import { notifications } from '../stores/notification.store';

/**
 * Configuration options for pagination navigation.
 */
export interface PaginationNavigationOptions {
	/** Entity type used for navigation (e.g., "artists" or "events"). */
	entity: string;

	/** Default number of items per page (falls back to 10 if not provided). */
	defaultSize?: number;

	/** Whether search query support is enabled (adds `search` parameter). */
	withSearch?: boolean;
}

/**
 * Composable hook for handling pagination navigation with loading and error states.
 *
 * @param options - Pagination navigation options
 * @returns Utility functions and state manager for pagination navigation
 *
 * @example
 * ```ts
 * const { navigateToPage, subscribeToLoading, resetLoadingState } = usePaginationNavigation({
 *   entity: 'artists',
 *   defaultSize: 20,
 *   withSearch: true
 * });
 *
 * // Navigate to page 2 with a search term
 * await navigateToPage(2, 'Beatles');
 * ```
 */
export function usePaginationNavigation(options: PaginationNavigationOptions) {
	const { entity, defaultSize = 10, withSearch = false } = options;

	const loadingManager = new LoadingStateManager();
	let currentLoadingState = loadingManager.getState();

	/**
	 * Subscribe to loading state changes.
	 *
	 * @param callback - Function called when loading state changes
	 * @returns A cleanup function to unsubscribe
	 */
	function subscribeToLoading(
		callback: (state: typeof currentLoadingState) => void
	): () => void {
		return loadingManager.subscribe(callback);
	}

	/**
	 * Navigate to a specific page while handling loading and errors.
	 *
	 * @param pageNumber - The page number to navigate to
	 * @param searchQuery - Optional search term to include in query params
	 */
	async function navigateToPage(pageNumber: number, searchQuery?: string): Promise<void> {
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
		/** Internal loading state manager instance */
		loadingManager,

		/** Getter for the current loading state */
		get state() {
			return currentLoadingState;
		},

		/** Subscribe to loading state changes */
		subscribeToLoading,

		/** Navigate to a given page (with optional search term) */
		navigateToPage,

		/** Reset the loading state manager */
		resetLoadingState: () => loadingManager.reset()
	};
}
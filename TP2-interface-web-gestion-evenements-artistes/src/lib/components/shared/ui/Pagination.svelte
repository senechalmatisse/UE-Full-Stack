<script lang="ts">
	import type { PaginationState } from '$lib/core';
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';
	import {
        PaginationUtils,
        DefaultPaginationStrategy,
        AppConfigPaginationProvider
    } from '$lib/core';
    import PaginationButton from './PaginationButton.svelte';

    /**
	 * Pagination component.
	 *
	 * Provides accessible navigation controls for traversing
	 * paginated data (e.g., lists of events or entities).
	 * Displays previous/next buttons, a set of visible page buttons,
	 * ellipsis for skipped ranges, and an info summary.
	 *
	 * Accessibility:
	 * - Uses `aria-label`, `aria-current`, and `role="group"` for screen reader support.
	 * - Keyboard navigation is supported via `Enter` and `Space`.
	 *
	 * @example
	 * ```svelte
	 * <Pagination
	 *   paginationState={{
	 *     page: 2,
	 *     totalPages: 10,
	 *     first: false,
	 *     last: false
	 *   }}
	 *   isLoading={false}
	 *   onPageChange={async (page) => {
	 *     console.log("Navigate to page:", page);
	 *   }}
	 * />
	 * ```
	 */

	/**
	 * Current pagination state, including:
	 * - `page`: current page index (1-based)
	 * - `totalPages`: total number of pages
	 * - `first`: whether the current page is the first one
	 * - `last`: whether the current page is the last one
	 */
	export let paginationState: PaginationState;

	/**
	 * Callback triggered when a new page is selected.
	 * Must be implemented by the parent to update data or state.
	 *
	 * @param page - The target page number
	 */
	export let onPageChange: (page: number) => Promise<void>;

	/**
	 * Loading state flag.
	 * When true, disables navigation to avoid duplicate requests.
	 */
	export let isLoading: boolean = false;

	const strategy = new DefaultPaginationStrategy();
	const configProvider = new AppConfigPaginationProvider();

    const paginationUtils = new PaginationUtils(configProvider, strategy);

	/** List of pages visible in the pagination, computed dynamically. */
	$: visiblePages = paginationUtils.getVisiblePages(
		paginationState.page, 
		paginationState.totalPages
	);

	/** Human-readable pagination summary string. */
	$: paginationInfo = paginationUtils.getPaginationInfo(
		paginationState.page, 
		paginationState.totalPages
	);

	const firstPage = 1;
	const lastPage = paginationState.totalPages;

	/**
	 * Handles page selection triggered by button click.
	 *
	 * Prevents duplicate calls if:
	 * - already loading
	 * - the current page is clicked again
	 *
	 * @param page - The page number to navigate to
	 */
	async function handlePageClick(page: number) {
		if (isLoading || page === paginationState.page) return;
		await onPageChange(page);
	}
</script>

{#if paginationState.totalPages > 1}
    <nav 
        class="pagination" 
        aria-label="Navigation entre pages"
    >
        <PaginationButton
            page={paginationState.page - 1}
            disabled={paginationState.first}
            isLoading={isLoading}
            ariaLabel="Retour vers la page précédente"
            extraClass="prev"
            onClick={handlePageClick}
        >
            <ArrowLeft size={16} />
            &nbsp; Précédent
        </PaginationButton>

		<div
            class="pagination-pages"
            role="group"
            aria-label="Pages disponibles"
        >
			{#if visiblePages[0] > firstPage}
                <PaginationButton
                    page={1}
                    isLoading={isLoading}
                    ariaLabel="Aller vers la page 1"
                    extraClass="page"
                    onClick={handlePageClick}
                />
				{#if visiblePages[0] > firstPage + 1}
					<span class="pagination-ellipsis" aria-hidden="true">
                        …
                    </span>
				{/if}
			{/if}

			{#each visiblePages as pageNum}
                <PaginationButton
                    page={pageNum}
                    isActive={pageNum === paginationState.page}
                    isLoading={isLoading}
                    ariaLabel={`Aller vers la page ${pageNum}`}
                    extraClass="page"
                    onClick={handlePageClick}
                />
			{/each}

			{#if visiblePages[visiblePages.length - 1] < lastPage}
				{#if visiblePages[visiblePages.length - 1] < lastPage - 1}
					<span class="pagination-ellipsis" aria-hidden="true">
                        …
                    </span>
				{/if}

                <PaginationButton
                    page={paginationState.totalPages}
                    isLoading={isLoading}
                    ariaLabel={`Aller vers la page ${paginationState.totalPages}`}
                    extraClass="page"
                    onClick={handlePageClick}
                />
			{/if}
		</div>

        <PaginationButton
            page={paginationState.page + 1}
            disabled={paginationState.last || isLoading}
            isLoading={isLoading}
            ariaLabel="Aller vers la page suivante"
            extraClass="next"
            onClick={handlePageClick}
        >
            Suivant &nbsp;
            <ArrowRight size={16}/>
        </PaginationButton>
    </nav>

    <div class="pagination-info" aria-live="polite">
        {paginationInfo}
    </div>
{/if}

<style>
    /* Pagination container */
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 2rem;
        font-family: 'Segoe UI', Roboto, sans-serif;
    }

    /* Pagination info */
    .pagination-info {
        margin-top: 1rem;
        text-align: center;
        font-size: 0.95rem;
        color: #7f8c8d;
    }

    /* Ellipsis */
    .pagination-ellipsis {
        font-size: 1.2rem;
        color: #7f8c8d;
        margin: 0 0.25rem;
    }

    /* Group of page buttons */
    .pagination-pages {
        display: flex;
        gap: 0.25rem;
        align-items: center;
    }
</style>
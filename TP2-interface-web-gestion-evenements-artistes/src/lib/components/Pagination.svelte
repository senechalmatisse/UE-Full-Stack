<script lang="ts">
	import type { PaginationState } from '../types/pagination';
	import { PaginationUtils } from '../utils/formatters';

	/**
	 * Current pagination state, including the current page,
	 * total pages, and navigation flags.
	 */
	export let paginationState: PaginationState;

	/**
	 * Callback triggered when a new page is selected.
	 * Must handle updating the parent state or data.
	 *
	 * @param page - The page number requested by the user
	 */
	export let onPageChange: (page: number) => Promise<void>;

	/**
	 * Loading state flag.
	 * When true, navigation is disabled to prevent duplicate requests.
	 */
	export let isLoading = false;

	/**
	 * Reactive declaration of visible pages, computed using PaginationUtils.
	 */
	$: visiblePages = PaginationUtils.getVisiblePages(
		paginationState.page, 
		paginationState.totalPages
	);

	/**
	 * Reactive declaration of pagination info string,
	 * e.g., "Page 2 of 5".
	 */
	$: paginationInfo = PaginationUtils.getPaginationInfo(
		paginationState.page, 
		paginationState.totalPages
	);

	/**
	 * Handles page selection when clicking a button.
	 *
	 * Prevents duplicate triggers if already loading or if
	 * the user selects the current page.
	 *
	 * @param page - The page number to navigate to
	 */
	async function handlePageClick(page: number) {
		if (isLoading || page === paginationState.page) return;
		await onPageChange(page);
	}

	/**
	 * Handles keyboard accessibility for pagination buttons.
	 *
	 * Supports Enter and Space keys to activate page navigation.
	 *
	 * @param event - KeyboardEvent from the button
	 * @param pageNum - The page number to navigate to
	 */
	function handleKeydown(event: KeyboardEvent, pageNum: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handlePageClick(pageNum);
		}
	}
</script>

<!-- 
	Pagination navigation.
	Provides accessible controls for navigating between pages of events.
-->
<nav 
	class="pagination" 
	aria-label="Event pages navigation"
>
	<!-- Previous button -->
	<button
		class="pagination-btn prev"
		on:click={() => handlePageClick(paginationState.page - 1)}
		disabled={paginationState.first || isLoading}
		aria-label="Retour vers la page précédente"
	>
		<span aria-hidden="true">◀</span>&nbsp;&nbsp;Précédent
	</button>

	<!-- Visible pages -->
	{#if paginationState.totalPages > 1}
		<div class="pagination-pages" role="group" aria-label="Available pages">
			<!-- First page button if not visible -->
			{#if visiblePages[0] > 1}
				<button
					class="pagination-btn page"
					on:click={() => handlePageClick(1)}
					on:keydown={(e) => handleKeydown(e, 1)}
					disabled={isLoading}
					aria-label="Go to page 1"
				>
					1
				</button>
				{#if visiblePages[0] > 2}
					<span class="pagination-ellipsis" aria-hidden="true">…</span>
				{/if}
			{/if}

			<!-- Loop through visible pages -->
			{#each visiblePages as pageNum}
				<button
					class={`pagination-btn page ${pageNum === paginationState.page ? 'active' : ''}`}
					on:click={() => handlePageClick(pageNum)}
					on:keydown={(e) => handleKeydown(e, pageNum)}
					disabled={pageNum === paginationState.page || isLoading}
					aria-label="Aller vers la page {pageNum}"
					aria-current={pageNum === paginationState.page ? 'page' : undefined}
				>
					{pageNum}
				</button>
			{/each}

			<!-- Last page button if not visible -->
			{#if visiblePages[visiblePages.length - 1] < paginationState.totalPages}
				{#if visiblePages[visiblePages.length - 1] < paginationState.totalPages - 1}
					<span class="pagination-ellipsis" aria-hidden="true">…</span>
				{/if}
				<button
					class="pagination-btn page"
					on:click={() => handlePageClick(paginationState.totalPages)}
					on:keydown={(e) => handleKeydown(e, paginationState.totalPages)}
					disabled={isLoading}
					aria-label="Aller vers la page {paginationState.totalPages}"
				>
					{paginationState.totalPages}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Next button -->
	<button
		class="pagination-btn next"
		on:click={() => handlePageClick(paginationState.page + 1)}
		disabled={paginationState.last || isLoading}
		aria-label="Aller vers la page suivante"
	>
		Suivant&nbsp;&nbsp;<span aria-hidden="true">▶</span>
	</button>
</nav>

<!-- Pagination info (screen reader friendly, updates politely) -->
<div class="pagination-info" aria-live="polite">
	{paginationInfo}
</div>

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

/* Page buttons */
.pagination-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  background-color: #ecf0f1;
  color: #2c3e50;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #bdc3c7;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Active page */
.pagination-btn.active {
  background-color: #3498db;
  color: white;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

/* Previous / Next buttons */
.pagination-btn.prev,
.pagination-btn.next {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4em;
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

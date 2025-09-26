<script lang="ts">
	import type { Event, PaginationState } from '../../lib/types/pagination';
	import EventsList from '../../lib/components/EventsList.svelte';
	import Pagination from '../../lib/components/Pagination.svelte';
	import LoadingState from '../../lib/components/LoadingState.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { usePaginationNavigation } from '../../lib/hooks/usePaginationNavigation';

	/** Props received from the server containing events and pagination state. */
	export let data: { events: Event[] } & PaginationState;

	/** Manages loading and error states during asynchronous operations. */
	/** Centralized loading state manager instance */
	const {
		loadingManager,
		subscribeToLoading,
		navigateToPage,
		resetLoadingState
	} = usePaginationNavigation({
		entity: 'artists',
		withSearch: true,
		defaultSize: 10
	});

    /** Current loading state of the page (loading, error, etc.). */
    let currentLoadingState = loadingManager.getState();

    /** Current loading state of the page (loading, error, etc.). */
    let unsubscribeFromLoading: (() => void) | null = null;

	/** Subscribe to loading state changes on mount. */
	onMount(() => {
		unsubscribeFromLoading = subscribeToLoading(
			(state) => (currentLoadingState = state)
		);
	});

	/** Unsubscribe from loading state changes on destroy. */
	onDestroy(() => unsubscribeFromLoading?.());

    /**
	 * Handles page navigation for pagination.
	 * Updates URL and triggers loading state.
	 * @param newPage - The target page number to navigate to
	 */
	async function handlePageChange(newPage: number) {
		if (currentLoadingState.isLoading || newPage === data.page) return;
		await navigateToPage(newPage);
	}

	/**
	 * Retry handler in case of loading or navigation errors.
	 * Resets loading state and reattempts loading current page.
	 */
	function handleRetry() {
		resetLoadingState();
		handlePageChange(data.page);
	}

	/** Reactive extraction of pagination state for child components. */
	$: paginationState = {
		page: data.page,
		totalPages: data.totalPages,
		first: data.first,
		last: data.last,
		totalElements: data.totalElements,
		size: data.size
	} satisfies PaginationState;
</script>

<svelte:head>
	<title>Liste des événements - Page {data.page}</title>
	<meta name="description" content="Décrouvez tous les événements. Page {data.page} sur {data.totalPages}." />
</svelte:head>

<section id="events-section">
	<header>
		<h1 class="events-title">Liste des événements</h1>
	</header>

	<div>
		<LoadingState 
			isLoading={currentLoadingState.isLoading}
			error={currentLoadingState.error}
			loadingMessage="Chargement des événements..."
			onRetry={handleRetry}
		/>

		{#if !currentLoadingState.isLoading}
			<EventsList 
				events={data.events}
				noEventsMessage="Aucun événement trouvé."
			/>

			{#if data.events.length > 0}
				<Pagination 
					{paginationState}
					onPageChange={handlePageChange}
					isLoading={currentLoadingState.isLoading}
				/>
			{/if}
		{/if}
	</div>
</section>

<style>
#events-section {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem;
}

.events-title {
	text-align: center;
	margin-bottom: 2rem;
	color: #333;
	font-size: 2.5rem;
}

@media (max-width: 768px) {
	#events-section {
		padding: 1rem;
	}

	.events-title {
		font-size: 2rem;
	}
}
</style>
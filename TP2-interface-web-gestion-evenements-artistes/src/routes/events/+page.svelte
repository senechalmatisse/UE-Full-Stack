<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Event, PaginationState } from '../../lib/types/pagination';
	import { LoadingStateManager } from '../../lib/utils/formatters';
	import EventsList from '../../lib/components/EventsList.svelte';
	import Pagination from '../../lib/components/Pagination.svelte';
	import LoadingState from '../../lib/components/LoadingState.svelte';
	import { onMount, onDestroy } from 'svelte';
    import { notifications } from '../../lib/stores/notification.store';

	/** Props received from the server containing events and pagination state. */
	export let data: { events: Event[] } & PaginationState;

	/** Manages loading and error states during asynchronous operations. */
	const loadingManager = new LoadingStateManager();
	let loadingState = loadingManager.getState();
	let unsubscribe: (() => void) | null = null;

	/** Subscribe to loading state changes on mount. */
	onMount(() => {
		unsubscribe = loadingManager.subscribe((state) => {
			loadingState = state;
		});
	});

	/** Unsubscribe from loading state changes on destroy. */
	onDestroy(() => {
		unsubscribe?.();
	});

	/**
	 * Handles page navigation for pagination.
	 * Updates URL and triggers loading state.
	 * @param newPage - The target page number to navigate to
	 */
	async function handlePageChange(newPage: number): Promise<void> {
		if (loadingState.isLoading || newPage === data.page) return;
		
		loadingManager.startLoading();
		
		try {
			const currentSize = $page.url.searchParams.get('size') || '4';
			await goto(`/events?page=${newPage}&size=${currentSize}`);

            loadingManager.stopLoading();
		} catch (error) {
			const errorMessage = error instanceof Error 
				? error.message 
				: 'Erreur lors du  chargement de la page. Réessayez.';
			
            notifications.error(errorMessage);
			loadingManager.setError(errorMessage);
		}
	}

	/**
	 * Retry handler in case of loading or navigation errors.
	 * Resets loading state and reattempts loading current page.
	 */
	function handleRetry() {
		loadingManager.reset();
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
	<meta name="description" content="Discover all available events. Page {data.page} of {data.totalPages}." />
</svelte:head>

<section id="events-section">
	<header>
		<h1 class="events-title">Liste des événements</h1>
	</header>
	
	<div>
		<!-- Loading and error states -->
		<LoadingState 
			isLoading={loadingState.isLoading}
			error={loadingState.error}
			loadingMessage="Chargement des événements..."
			onRetry={handleRetry}
		/>

		<!-- Div content -->
		{#if !loadingState.isLoading}
			<EventsList 
				events={data.events} 
				emptyMessage="Aucun événement trouvé."
			/>

			<!-- Pagination (only if there are events) -->
			{#if data.events.length > 0}
				<Pagination 
					{paginationState}
					onPageChange={handlePageChange}
					isLoading={loadingState.isLoading}
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

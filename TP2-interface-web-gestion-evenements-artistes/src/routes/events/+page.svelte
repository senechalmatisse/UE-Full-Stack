<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Event, PaginationState } from '../../lib/types/pagination';
	import { LoadingStateManager } from '../../lib/utils/formatters';
	import EventsList from '../../lib/components/EventsList.svelte';
	import Pagination from '../../lib/components/Pagination.svelte';
	import LoadingState from '../../lib/components/LoadingState.svelte';
	import { onMount, onDestroy } from 'svelte';

	/**
	 * Props received from the server containing events and pagination state.
	 */
	export let data: { events: Event[] } & PaginationState;

	/**
	 * Manages loading and error states during asynchronous operations.
	 */
	const loadingManager = new LoadingStateManager();
	let loadingState = loadingManager.getState();
	let unsubscribe: (() => void) | null = null;

	/**
	 * Subscribe to loading state changes on mount.
	 */
	onMount(() => {
		unsubscribe = loadingManager.subscribe((state) => {
			loadingState = state;
		});
	});

	/**
	 * Unsubscribe from loading state changes on destroy.
	 */
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
				: 'Error while changing page. Please try again.';
			
			loadingManager.setError(errorMessage);
			console.error('Navigation error:', error);
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

	/**
	 * Reactive extraction of pagination state for child components.
	 */
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
	<title>Event List - Page {data.page}</title>
	<meta name="description" content="Discover all available events. Page {data.page} of {data.totalPages}." />
</svelte:head>

<section id="events-section">
	<header>
		<h1 class="events-title">Event List</h1>
	</header>
	
	<main>
		<!-- Loading and error states -->
		<LoadingState 
			isLoading={loadingState.isLoading}
			error={loadingState.error}
			loadingMessage="Loading events..."
			onRetry={handleRetry}
		/>

		<!-- Main content -->
		{#if !loadingState.isLoading}
			<EventsList 
				events={data.events} 
				emptyMessage="No events found."
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
	</main>
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

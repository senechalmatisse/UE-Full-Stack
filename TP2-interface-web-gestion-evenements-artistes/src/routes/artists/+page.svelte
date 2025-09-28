<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Artist, PaginationState } from '$lib/types/pagination';
	import ArtistsList from '$lib/components/artists/ArtistsList.svelte';
	import Pagination from '$lib/components/shared/ui/Pagination.svelte';
	import LoadingState from '$lib/components/shared/states/LoadingState.svelte';
	import SearchInput from '$lib/components/shared/ui/SearchInput.svelte';
	import { usePaginationNavigation } from '$lib/hooks/usePaginationNavigation';

	/**
	 * Server-provided data for the artists page.
	 * Includes the list of artists, the optional search term, and pagination metadata.
	 */
	export let data: { artists: Artist[]; searchTerm?: string } & PaginationState;

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

	/** Current search term, synchronized with query params */
	let currentSearchTerm: string = data.searchTerm ?? '';

	/** Subscribe to loading state changes when the component mounts. */
	onMount(() => {
		unsubscribeFromLoading = subscribeToLoading(
			(state) => (currentLoadingState = state)
		);
	});

	/** Clean up subscriptions when the component is destroyed. */
	onDestroy(() => unsubscribeFromLoading?.());

	/**
	 * Handle pagination change.
	 * Navigates to the requested page while preserving the current search term.
	 *
	 * @param newPage - The new page number to load
	 */
	async function handlePageChange(newPage: number) {
		if (currentLoadingState.isLoading || newPage === data.page) return;
		await navigateToPage(newPage, currentSearchTerm);
	}

	/**
	 * Handle search input changes.
	 * Resets pagination to page 1 when a new term is searched.
	 *
	 * @param term - The new search term entered by the user
	 */
	async function handleSearch(term: string) {
		currentSearchTerm = term;
		await navigateToPage(1, currentSearchTerm);
	}

	/**
	 * Retry handler in case of errors.
	 * Reloads the current page while resetting the loading state.
	 */
	function handleRetry() {
		resetLoadingState();
		handlePageChange(data.page);
	}

	/** Derived pagination state for the Pagination component */
	$: paginationState = {
		page: data.page,
		totalPages: data.totalPages,
		first: data.first,
		last: data.last,
		totalElements: data.totalElements,
		size: data.size
	} satisfies PaginationState;

	/** Contextual empty state message depending on search usage */
	$: emptyMessage = currentSearchTerm
		? `Aucun artiste trouvé pour "${currentSearchTerm}".`
		: 'Aucun artiste trouvé.';

	/** Client-side filtering of artists based on the current search term */
	$: filteredArtists = data.artists.filter((artist) =>
		artist.label.toLowerCase().includes(currentSearchTerm.toLowerCase())
	);
</script>

<svelte:head>
	<title>Liste des artistes - Page {data.page}</title>
	<meta
        name="description"
        content="Décrouvez tous les artistes. Page {data.page} sur {data.totalPages}."
    />
</svelte:head>

<section id="artists-section">
	<header id="artists-header">
		<h1 class="artists-title">Liste des artistes</h1>
		<SearchInput
			placeholder="Rechercher un artiste..."
			searchValue={currentSearchTerm}
			on:search={(e) => handleSearch(e.detail)}
			on:clear={() => handleSearch('')}
		/>
	</header>

	<div>
		<LoadingState
			isLoading={currentLoadingState.isLoading}
			error={currentLoadingState.error}
			loadingMessage="Chargement des artistes..."
			onRetry={handleRetry}
		/>

		{#if !currentLoadingState.isLoading}
			<ArtistsList 
				artistList={filteredArtists}
				emptyStateMessage={emptyMessage}
				currentSearchQuery={currentSearchTerm}
				isLoading={currentLoadingState.isLoading}
                on:clear={() => handleSearch('')}
			/>

			{#if filteredArtists.length > 0}
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
    #artists-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

	#artists-section {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.artists-title {
		text-align: center;
		margin-bottom: 2rem;
		color: #333;
		font-size: 2.5rem;
	}

	@media (max-width: 768px) {
		#artists-section {
			padding: 1rem;
		}

		.artists-title {
			font-size: 2rem;
		}
	}
</style>
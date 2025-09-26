<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Artist } from '../types/pagination';
	import ArtistCard from './ArtistCard.svelte';

	/**
	 * List of artists to display.
	 * Each artist must conform to the `Artist` interface.
	 */
	export let artistList: Artist[] = [];

	/** Message to display when there are no artists. */
	export let emptyStateMessage: string = 'No artists found.';

	/**
	 * Current search query used for filtering artists.
	 * When empty, all artists are displayed.
	 */
	export let currentSearchQuery: string = '';

	/** Indicates whether the component is in a loading state. */
	export let isLoading = false;

	/** Dispatches events to the parent component. */
	const dispatch = createEventDispatcher<{ clear: void }>();

	/**
	 * Resets the current search query.
	 * Triggers the `clear` event so that the parent can reload all artists.
	 */
	function handleClearSearch(): void {
		dispatch('clear');
	}
</script>

{#if !artistList || artistList.length === 0}
	<div
        id="artists-empty-container"
        role="status"
		aria-live="polite"
        aria-label="Liste vide des artistes"
    >
		{#if currentSearchQuery}
			<p class="artists-empty-title">{emptyStateMessage}</p>
			<p class="artists-empty-suggestion">
				Essayez avec un autre terme ou 
				<button
					class="clear-search-link"
					on:click={handleClearSearch}
					aria-label="Réinitialiser la recherche et voir tous les artistes"
				>
					voir tous les artistes
				</button>
			</p>
		{:else}
			<p class="artists-empty-title">{emptyStateMessage}</p>
		{/if}
	</div>
{:else}
	<div
        id="artists-list-container"
        role="status"
		aria-live="polite"
        aria-label="Liste des événements"
    >
		<div class="artists-count" aria-live="polite">
			{artistList.length} artiste{artistList.length > 1 ? 's' : ''}
			{#if currentSearchQuery}
				pour "{currentSearchQuery}"
			{/if}
		</div>

		<ul class="artists-list">
			{#each artistList as artist, index (artist.id)}
				<ArtistCard 
					{artist} 
					{isLoading}
					animationDelay={index * 50}
				/>
			{/each}
		</ul>
	</div>
{/if}

<style>
    #artists-list-container {
        margin-bottom: 2rem;
    }

    .artists-count {
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        padding: 0.5rem 0;
    }

    /* Grid styling for artists list */
    .artists-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    /* Empty state */
    #artists-empty-container {
        text-align: center;
        padding: 3rem 1rem;
        color: #6b7280;
    }

    .artists-empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }

    .artists-empty-suggestion {
        font-size: 0.875rem;
        color: #9ca3af;
    }

    .clear-search-link {
        background: none;
        border: none;
        color: #3b82f6;
        text-decoration: underline;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        margin: 0;
    }

    .clear-search-link:hover,
    .clear-search-link:focus {
        color: #2563eb;
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        border-radius: 2px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .artists-list {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        #artists-empty-container {
            padding: 2rem 1rem;
        }

        .artists-empty-title {
            font-size: 1.125rem;
        }
    }

    @media (max-width: 480px) {
        .artists-list {
            gap: 0.75rem;
        }

        .artists-count {
            font-size: 0.8125rem;
        }
    }
</style>
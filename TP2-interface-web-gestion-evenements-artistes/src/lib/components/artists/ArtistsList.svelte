<script lang="ts">
	import type { Artist } from '$lib/types/pagination';
	import ArtistCard from './ArtistCard.svelte';
	import EntityList from '$lib/components/shared/lists/EntityList.svelte';

	/**
	 * ArtistsList Component
	 *
	 * This component is responsible for displaying a list of artists.
	 * It leverages the reusable `EntityList` component to manage:
	 * - Empty states
	 * - Search query filtering
	 * - Clear events
	 *
	 * Each artist in the list is rendered using the `ArtistCard` component,
	 * with a small animation delay applied to improve visual appearance.
	 *
	 * @example
	 * <ArtistsList
	 *   artistList={artists}
	 *   emptyStateMessage="No results found."
	 *   currentSearchQuery="John"
	 *   isLoading={false}
	 *   on:clear={() => console.log("Search cleared")}
	 * />
	 */

	/**
	 * The list of artists to display.
	 * Defaults to an empty array when no data is provided.
	 */
	export let artistList: Artist[] = [];

	/**
	 * The message displayed when no artists are available.
	 * Useful for customizing empty state feedback.
	 */
	export let emptyStateMessage = 'Aucun artiste trouvé.';

	/**
	 * The current search query string used for filtering artists.
	 * Passed down to the `EntityList` component for consistency.
	 */
	export let currentSearchQuery = '';

	/**
	 * Whether the list is currently loading.
	 * Passed down to `ArtistCard` to disable interactions or show loading states.
	 */
	export let isLoading = false;
</script>

<EntityList
	items={artistList}
	emptyMessage={emptyStateMessage}
	entityLabel="artiste"
	searchQuery={currentSearchQuery}
	on:clear
	let:items
>
	{#each items as artist, index (artist.id)}
		<ArtistCard {artist} {isLoading} animationDelay={index * 50} />
	{/each}
</EntityList>
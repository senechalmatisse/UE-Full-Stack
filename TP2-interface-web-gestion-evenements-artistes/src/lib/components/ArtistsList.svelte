<script lang="ts">
	import type { Artist } from '../types/pagination';
	import ArtistCard from './ArtistCard.svelte';
	import EntityList from './EntityList.svelte';

	export let artistList: Artist[] = [];
	export let emptyStateMessage = 'No artists found.';
	export let currentSearchQuery = '';
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
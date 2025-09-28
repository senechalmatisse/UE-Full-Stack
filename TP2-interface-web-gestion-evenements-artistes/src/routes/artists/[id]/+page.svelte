<script lang="ts">
	import type { Artist, Event } from '$lib/types/pagination';
	import ArtistDetail from '$lib/components/artists/ArtistDetail.svelte';
	import ArtistEvents from '$lib/components/artists/ArtistEvents.svelte';

    /**
     * Props received from the server load function.
     * Contains the selected artist and the list of associated events.
     */
	export let data: { artist: Artist; events: Event[] };

    /** Local state representing the current artist. */
	let artist: Artist = data.artist;

    /** Local state representing the list of events associated with the artist. */
	let events: Event[] = data.events;
</script>

<svelte:head>
	<title>Détails - {artist.label}</title>
	<meta
		name="description"
		content={`Informations et événements associés pour ${artist.label ?? 'cet artiste'}`}
	/>
</svelte:head>

<section id="artist-detail">
	<header>
		<h1 id="artist-title">{artist.label}</h1>
	</header>

	<div class="artist-detail-layout">
		<ArtistDetail {artist} on:updated={(a: { detail: Artist; }) => (artist = a.detail)} />
		<ArtistEvents {artist} bind:events />
	</div>
</section>

<style>
    /* === Container === */
    #artist-detail {
        padding: 2rem;
        margin: 0 auto;
        max-width: 1200px;
    }

    /* === Header === */
    #artist-detail header {
        text-align: center;
        margin-bottom: 2rem;
    }

    /* === Layout === */
    .artist-detail-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
    }

    @media (max-width: 768px) {
        .artist-detail-layout {
            grid-template-columns: 1fr;
        }
    }
</style>
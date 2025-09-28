<script lang="ts">
	import type { Event } from '$lib/types/pagination';
	import EventDetail from '$lib/components/events/EventDetail.svelte';
	import EventArtists from '$lib/components/events/EventArtists.svelte';

	/** Props received from the server containing the event details. */
	export let data: { event: Event };

	/**
	 * Local reactive variable holding the event details.
	 * Updated when child components emit changes.
	 */
	let event: Event = data.event;
</script>

<svelte:head>
	<title>Détails - {event.label}</title>
	<meta
		name="description"
		content={`Informations et artistes associés pour ${event.label ?? 'cet événement'}`}
	/>
</svelte:head>

<section id="event-detail">
	<header>
		<h1 id="event-title">{event.label}</h1>
	</header>

    <div class="event-detail-layout">
		<EventDetail event={event} on:updated={(e) => (event = e.detail)} />
		<EventArtists {event} />
    </div>
</section>

<style>
    /* === Container === */
    #event-detail {
        padding: 2rem;
        margin: 0 auto;
        max-width: 1200px;
    }

    /* === Header === */
    #event-detail header {
        text-align: center;
        margin-bottom: 2rem;
    }

    /* === Layout === */
    .event-detail-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
    }

    @media (max-width: 768px) {
        .event-detail-layout {
            grid-template-columns: 1fr;
        }
    }
</style>
<script lang="ts">
	import type { Event } from '../../../lib/types/pagination';
	import EventDetail from '../../../lib/components/EventDetail.svelte';
	import EventArtists from '../../../lib/components/EventArtists.svelte';

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
	<meta name="description" content="Detailed information and associated artists for event {event.label}" />
</svelte:head>

<section id="event-detail">
    <header>
        <h1>{event.label}</h1>
    </header>

    <div class="event-detail-layout">
        <!-- Event detail form/component; emits 'updated' event when changes occur -->
        <EventDetail event={event} on:updated={(e) => event = e.detail} />

        <!-- Associated artists management component -->
        <EventArtists event={data.event} />
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

.event-detail-layout section {
  margin: 0;
  padding: 0;
}
</style>
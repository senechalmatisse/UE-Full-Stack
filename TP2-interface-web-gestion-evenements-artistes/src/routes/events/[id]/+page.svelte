<script lang="ts">
	import type { Event } from '../../../lib/types/pagination';
	import EventDetail from '../../../lib/components/EventDetail.svelte';
	import EventArtists from '../../../lib/components/EventArtists.svelte';

	export let data: { event: Event };

	let event: Event = data.event;
</script>

<svelte:head>
	<title>Détails - {event.label}</title>
</svelte:head>

<section id="event-detail">
    <header>
        <h1>{event.label}</h1>
    </header>

    <div class="event-detail-layout">
        <EventDetail event={event} on:updated={(e) => event = e.detail} />
        <EventArtists event={data.event} />
    </div>
</section>

<style>
#event-detail {
  padding: 2rem;
  margin: 0 auto;
  max-width: 1200px;
}

#event-detail header {
  text-align: center;
  margin-bottom: 2rem;
}

.event-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0; /* Supprime l’espace entre les colonnes */
}

/* Supprime les marges internes éventuelles des composants */
.event-detail-layout section {
  margin: 0;
  padding: 0;
}
</style>
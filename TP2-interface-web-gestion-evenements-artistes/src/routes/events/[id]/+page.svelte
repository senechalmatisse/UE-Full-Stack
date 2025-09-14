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

	<EventDetail event={event} on:updated={(e) => event = e.detail} />
	<EventArtists event={data.event} />
</section>
<script lang="ts">
	import type { Event } from '$lib/core';
    import { EntityDeletionConfigFactory, createEventService } from '$lib/core';
	import EventDetail from '$lib/components/events/EventDetail.svelte';
	import EventArtists from '$lib/components/events/EventArtists.svelte';
    import EntityDeletionHandler from '$lib/components/shared/forms/EntityDeletionHandler.svelte';

	/** Props received from the server containing the event details. */
	export let data: { event: Event };

	/**
	 * Local reactive variable holding the event details.
	 * Updated when child components emit changes.
	 */
	let event: Event = data.event;

    const eventService = createEventService();

    $: deletionConfig = EntityDeletionConfigFactory.createEventDeletionConfig(
        event.id,
        eventService,
        event.artists?.length || 0
    );
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
        <EntityDeletionHandler config={deletionConfig} variant="warning" />
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

    .event-detail > header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
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

        .event-detail > header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
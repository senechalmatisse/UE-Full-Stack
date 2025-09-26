<script lang="ts">
	import type { Event } from '../types/pagination';
	import EventCard from './EventCard.svelte';

	/**
	 * List of events to display.
	 * Each event must conform to the Event interface.
	 */
	export let events: Event[] = [];

	/** Message to display when there are no events. */
	export let noEventsMessage: string = 'No events found.';

	/**
	 * Sorted list of events by their start date (ascending).
	 * Reactive statement updates whenever `events` changes.
	 */
	$: sortedEventList = events
		? [...events].sort(
				(a, b) =>
					new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
		  )
		: [];
</script>

{#if !events || events.length === 0}
	<div
        id="events-empty-container"
        role="status"
		aria-live="polite"
        aria-label="Liste vide des événements"
    >
        <slot name="empty">
            <p class="events-empty-title">{noEventsMessage}</p>
		</slot>
    </div>
{:else}
	<div
        id="events-list-container"
        role="status"
		aria-live="polite"
        aria-label="Liste des événements"
    >
		<article class="events-count" aria-live="polite">
			{events.length} événement{events.length > 1 ? 's' : ''}
		</article>

		<ul class="events-list">
			{#each sortedEventList as event, index (event.id)}
                <EventCard
                    {event}
					animationDelay={index * 50}
                />
			{/each}
		</ul>
    </div>
{/if}

<style>
    #events-list-container {
        margin-bottom: 2rem;
    }

    .events-count {
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        padding: 0.5rem 0;
    }

    /* Grid styling for events list */
    .events-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    /* Empty States */
    #events-empty-container {
        text-align: center;
        padding: 3rem 1rem;
        color: #6b7280;
    }

    .events-empty-title  {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .events-list {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        #events-empty-container {
            padding: 2rem 1rem;
        }

        .events-empty-title {
            font-size: 1.125rem;
        }
    }

    @media (max-width: 480px) {
        .events-list {
            gap: 0.75rem;
        }

        .events-count {
            font-size: 0.8125rem;
        }
    }
</style>
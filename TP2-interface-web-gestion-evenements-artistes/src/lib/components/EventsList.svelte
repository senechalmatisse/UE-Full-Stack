<script lang="ts">
	import type { Event } from '../types/pagination';
	import { DateFormatterFactory } from '../utils/formatters';
	import EventCard from './EventCard.svelte';

	/**
	 * Array of events to display.
	 * Each event must conform to the Event interface.
	 */
	export let events: Event[] = [];

	/**
	 * Message to display when there are no events.
	 * Defaults to 'No events found.'
	 */
	export let emptyMessage = 'Aucun événement trouvé.';

	/**
	 * Date formatter instance used to format event dates.
	 * Defaults to a French locale formatter.
	 */
	const dateFormatter = DateFormatterFactory.getFrenchFormatter();
</script>

{#if events.length === 0}
	<!-- Empty state message -->
	<p class="events-empty">{emptyMessage}</p>
{:else}
	<!-- List of events -->
	<ul class="events-list">
		{#each events as event (event.id)}
			<EventCard {event} {dateFormatter} />
		{/each}
	</ul>
{/if}

<style>
	/* Styling for empty events message */
	.events-empty {
		text-align: center;
		font-size: 1.2rem;
		color: #666;
		margin: 3rem 0;
	}

	/* Grid styling for events list */
	.events-list {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	/* Responsive layout for smaller screens */
	@media (max-width: 768px) {
		.events-list {
			grid-template-columns: 1fr;
		}
	}
</style>
<script lang="ts">
	import type { Event } from '$lib/core';
	import EventCard from './EventCard.svelte';
	import EntityList from '$lib/components/shared/lists/EntityList.svelte';

	/**
	 * EventsList Component
	 *
	 * This component renders a list of events using the reusable `EntityList` component.
	 * Events are automatically sorted by their `startDate` in ascending order
	 * before being displayed. Each event is represented with an `EventCard` component.
	 *
	 * Features:
	 * - Automatic chronological sorting of events.
	 * - Customizable empty state message.
	 * - Integration with `EntityList` for count display and empty states.
	 *
	 * @example
	 * <EventsList
	 *   events={events}
	 *   noEventsMessage="No events available."
	 * />
	 */

	/**
	 * The array of events to display.
	 * Defaults to an empty array if no events are provided.
	 */
	export let events: Event[] = [];

    /** Total number of events available across all pages */
    export let totalEvents: number | undefined = undefined;

	/**
	 * The message displayed when no events are found.
	 * Useful for customizing the empty state feedback.
	 */
	export let noEventsMessage = 'Aucun événement trouvé.';

	/**
	 * A reactive, chronologically sorted copy of the `events` array.
	 * Sorting is based on the event `startDate` (earliest first).
	 */
	$: sortedEventList = events
		? [...events].sort(
				(a, b) =>
					new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
		  )
		: [];
</script>

<EntityList
	items={sortedEventList}
    totalItems={totalEvents}
	emptyMessage={noEventsMessage}
	entityLabel="événement"
	showCount={true}
	let:items
>
	{#each items as event, index (event.id)}
		<EventCard {event} animationDelay={index * 50} />
	{/each}
</EntityList>
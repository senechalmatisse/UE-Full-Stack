<script lang="ts">
	import type { Event } from '$lib/types/pagination';
	import EventCard from './EventCard.svelte';
	import EntityList from '../shared/lists/EntityList.svelte';

	export let events: Event[] = [];
	export let noEventsMessage = 'No events found.';

	$: sortedEventList = events
		? [...events].sort(
				(a, b) =>
					new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
		  )
		: [];
</script>

<EntityList
	items={sortedEventList}
	emptyMessage={noEventsMessage}
	entityLabel="événement"
	showCount={true}
	let:items
>
	{#each items as event, index (event.id)}
		<EventCard {event} animationDelay={index * 50} />
	{/each}
</EntityList>
<script lang="ts">
	import type { Event } from '../types/pagination';
	import type { DateFormatter } from '../utils/formatters';

	/**
	 * Event data to display in the card.
	 * Must conform to the Event interface.
	 */
	export let event: Event;

	/** Instance of DateFormatter used to format event start and end dates. */
	export let dateFormatter: DateFormatter;

	/**
	 * Display string for up to two artist names.
	 * If there are no artists, this will be an empty string.
	 */
	$: artistsDisplay = event.artists.length > 0 
		? event.artists.slice(0, 2).map(a => a.label).join(', ')
		: '';
	
	/** Number of additional artists not shown in the main display. */
	$: additionalArtists = event.artists.length > 2 ? event.artists.length - 2 : 0;
</script>

<li id={`event-${event.id}`} class="event-card">
	<!-- Event title -->
	<h2 class="event-title">{event.label}</h2>
	
	<!-- Event date range -->
	<p class="event-dates">
		Du <time class="event-start" datetime={event.startDate}>
			{dateFormatter.format(event.startDate)}
		</time> 
		au <time class="event-end" datetime={event.endDate}>
			{dateFormatter.format(event.endDate)}
		</time>
	</p>
	
	<!-- Artists list -->
	{#if event.artists.length > 0}
		<p class="event-artists">
			<span class="artists-count">
				{event.artists.length} Artiste{event.artists.length > 1 ? 's ' : ' '}:
			</span>
			<span class="event-artists-list">
				{artistsDisplay}
			</span>
			{#if additionalArtists > 0}
				<span class="event-artists-more">
					... (+{additionalArtists} en plus)
				</span>
			{/if}
		</p>
	{:else}
		<p class="event-no-artists">Aucun artiste</p>
	{/if}
	
	<!-- Link to event details page -->
	<a 
		href={`/events/${event.id}`} 
		class="event-link"
		aria-label="Détails sur l'évènement {event.label}"
	>
		Voir informations&nbsp;&nbsp;<span aria-hidden="true">▼</span>
	</a>
</li>

<style>
/* Card container styling */
.event-card {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 1.5rem;
	background: white;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.event-card:focus-within {
	outline: 2px solid #007bff;
	outline-offset: 2px;
}	

/* Event title styling */
.event-title {
	margin: 0 0 1rem 0;
	color: #333;
	font-size: 1.3rem;
}

/* Event date styling */
.event-dates {
    font-size: 0.95rem;
    color: #7f8c8d;
    margin-bottom: 0.75rem;
}

.event-start,
.event-end {
	font-weight: 600;
	color: #555;
	white-space: nowrap;
}

/* Artists list styling */
.event-artists {
	margin-bottom: 1rem;
	color: #555;
}

.artists-count {
	font-weight: 500;
    margin-right: 0.25rem;
}

.event-artists-list {
	font-weight: 500;
    color: #2980b9;
}

.event-artists-more {
	font-style: italic;
	color: #777;
}

.event-no-artists {
    font-size: 0.9rem;
	color: #999;
	font-style: italic;
	margin-bottom: 1rem;
}

/* Event link styling */
.event-link {
	display: inline-block;
	background: #007bff;
	color: white;
	text-decoration: none;
	padding: 0.5rem 1rem;
	border-radius: 4px;
	transition: background-color 0.2s ease;
}

.event-link:hover, .event-link:focus {
	background: #0056b3;
	outline: 2px solid #0056b3;
	outline-offset: 2px;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
	.event-card {
		transition: none;
	}
}
</style>
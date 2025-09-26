<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import type { Event } from '../types/pagination';
	import { DateFormatterFactory } from '../utils/formatters';

	/**
	 * Event data to display in the card.
	 * Must conform to the Event interface.
	 */
	export let event: Event;

	/**
	 * Delay (in milliseconds) applied to the CSS animation
	 * for staggered list appearance.
	 */
	export let animationDelay = 0;

	/**
	 * Date formatter instance used to format event dates.
	 * Defaults to a French locale formatter.
	 */
	const dateFormatter = DateFormatterFactory.getFrenchFormatter();

	/**
	 * Slice of up to two artist objects to display directly in the card.
	 * If there are no artists, this will be an empty array.
	 */
    $: artistsDisplay = event.artists.slice(0, 2);

	/**
	 * Number of additional artists not displayed directly in the card.
	 * Used to show a summary indicator (e.g. "+2 more").
	 */
	$: additionalArtists = event.artists.length > 2 ? event.artists.length - 2 : 0;

	/**
	 * Formats the start and end dates of the event.
	 * - If start and end are the same date, returns the single date.
	 * - If different, returns a formatted date range.
	 * - Falls back to a default error message if formatting fails.
	 *
	 * @param event - The event object containing start and end dates
	 * @returns A formatted date string or a fallback message
	 */
	function formatEventDates(event: Event): string {
		try {
			const start = dateFormatter.format(event.startDate);
			const end = dateFormatter.format(event.endDate);
			return start === end ? start : `${start} – ${end}`;
		} catch {
			return 'Dates non disponibles';
		}
	}
</script>

<!-- 
	Single event card.
	Displays the event title, date(s), associated artists, 
	and a link to the event detail page. 
-->
<li
    id={`event-${event.id}`}
    class="card"
	style="animation-delay: {animationDelay}ms"
	aria-labelledby="event-name-{event.id}"
>
	<header class="card-header">
		<h2 id="event-title-{event.id}" class="card-title">
			{event.label}
		</h2>

		<!-- Badge showing the number of associated artists -->
		{#if event.artists.length > 0}
			<div
                class="badge"
                title="{event.artists.length} artiste{event.artists.length > 1 ? 's' : ''}"
            >
				{event.artists.length}
			</div>
		{/if}

		<!-- Event date(s) -->
        <time class="event-dates" datetime="{event.startDate}">
			{formatEventDates(event)}
		</time>
	</header>

	<div class="card-content">
		<!-- Artists section -->
        {#if event.artists.length > 0}
            <div class="card-section">
                <h3 class="card-section-title">Artistes associés</h3>
                <ul id="linked-informations">
                    {#each artistsDisplay as artist (event.id)}
                        <li class="artist-item">
                            <a
								href={`/artists/${artist.id}`}
								class="artist-details"
								aria-label="Voir la fiche de l'artiste {artist.label}"
							>
                                <span class="related-item-label">{artist.label}</span>
                            </a>
                        </li>
                    {/each}
					<!-- Summary for additional artists -->
                    {#if additionalArtists > 0}
                        <li class="additional-information">
                            <span class="additional-count">
                                +{additionalArtists} autre{additionalArtists > 1 ? 's' : ''}
                                artiste{additionalArtists > 1 ? 's' : ''}
                            </span>
                        </li>
                    {/if}
                </ul>
            </div>
        {:else}
			<!-- Empty state when no artists are linked -->
            <div class="no-information">
                <p>Aucun artiste associé pour le moment.</p>
            </div>
        {/if}
    </div>

	<footer class="card-footer">
		<!-- Link to event details page -->
		<a
			href="/events/{event.id}"
			class="card-link"
			aria-label="Voir les détails de {event.label}"
		>
			<span>Voir détails</span>
			<ArrowRight size={16} />
        </a>
	</footer>
</li>

<style>
    @import '../styles/card.css';

	/* Artist list item */
    .artist-item {
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: background-color 0.2s;
    }

    .artist-item:hover {
        background: #f1f5f9;
    }

    .artist-details {
        text-decoration: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.artist-details {
			gap: 0.125rem;
		}
	}
</style>
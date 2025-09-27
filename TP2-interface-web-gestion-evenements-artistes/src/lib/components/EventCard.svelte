<script lang="ts">
    import type { Event } from "../types/pagination";
    import { DateFormatterFactory } from "../utils/formatters";
    import CardBase from "./CardBase.svelte";

    /**
     * EventCard component.
     *
     * Displays a card with information about a single event,
     * including its date(s) and associated artists (up to 2 directly visible).
     * Additional artists are summarized with a "+X more" message.
     *
     * @example
     * ```svelte
     * <EventCard
     *   event={{
     *     id: "1",
     *     label: "Summer Festival",
     *     startDate: "2025-06-01",
     *     endDate: "2025-06-03",
     *     artists: [{ id: "a1", label: "Artist One" }]
     *   }}
     *   animationDelay={200}
     * />
     * ```
     */


    /** The event entity displayed in the card. */
    export let event: Event;

    /** Delay (in milliseconds) applied to the CSS animation for staggered appearance. */
    export let animationDelay = 0;

    /** French locale date formatter instance. */
    const dateFormatter = DateFormatterFactory.getFrenchFormatter();

    /** First 2 artists displayed in the card. */
    $: artistsDisplay = event.artists.slice(0, 2);

    /** Number of artists not displayed in the preview list. */
    $: additionalArtists = Math.max(0, event.artists.length - 2);

    /**
     * Formats an event's start and end dates into a human-readable string.
     *
     * @param event - The event object to format.
     * @returns A formatted string (e.g., "12 Jan 2024 – 15 Jan 2024")
     *          or "Dates unavailable" if formatting fails.
     */
    function formatEventDates(event: Event): string {
        try {
            const start = dateFormatter.format(event.startDate);
            const end = dateFormatter.format(event.endDate);
            return start === end ? start : `${start} – ${end}`;
        } catch {
            return "Dates non disponibles";
        }
    }
</script>

<CardBase
    id={"event-" + event.id}
    title={event.label}
    linkHref={`/events/${event.id}`}
    linkLabel="Voir détails"
    badgeCount={event.artists.length}
    {animationDelay}
>
    <div slot="content">
        <!-- Event date(s) -->
        <time class="event-dates" datetime={event.startDate}>
            {formatEventDates(event)}
        </time>

        <!-- Artists section -->
        {#if event.artists.length > 0}
            <div class="card-section">
                <h3 class="card-section-title">Artistes associés</h3>
                <ul class="linked-informations">
                    {#each artistsDisplay as artist (artist.id)}
                        <li class="artist-item">
                            <a href={`/artists/${artist.id}`} class="artist-details">
                                <span class="related-item-label">{artist.label}</span>
                            </a>
                        </li>
                    {/each}

                    {#if additionalArtists > 0}
                        <li class="additional-information">
                            <span class="additional-count">
                                +{additionalArtists} autre{additionalArtists > 1 ? "s" : ""} artiste{additionalArtists > 1 ? "s" : ""}
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
</CardBase>

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
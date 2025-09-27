<script lang="ts">
    import type { Artist, Event } from "../types/pagination";
    import { createArtistService } from "../services/artist.service";
    import { DateFormatterFactory } from "../utils/formatters";
    import { onMount } from "svelte";
    import CardBase from "./CardBase.svelte";

    /**
     * ArtistCard component.
     *
     * Displays a card with information about a specific artist,
     * including a list of associated events (up to 3 initially displayed).
     * Handles loading, error, and empty states with retry functionality.
     *
     * @example
     * ```svelte
     * <ArtistCard
     *   artist={{ id: "1", label: "John Doe" }}
     *   isLoading={false}
     *   animationDelay={150}
     * />
     * ```
     */

    /** The artist entity displayed in the card. */
    export let artist: Artist;

    /**
     * Loading state flag.
     * When true, the entire card is dimmed and interaction is disabled.
     */
    export let isLoading = false;

    /** Delay (in milliseconds) applied to the CSS animation for staggered appearance. */
    export let animationDelay = 0;

    /** Service used to fetch artist-related data. */
    const artistService = createArtistService();

    /** French locale date formatter instance. */
    const dateFormatter = DateFormatterFactory.getFrenchFormatter();

    /** List of events associated with the artist. */
    let events: Event[] = [];

    /** Loading state specific to event fetching. */
    let isLoadingEvents = true;

    /** Error message shown when fetching events fails. */
    let error: string | null = null;

    /** Number of retry attempts for loading events. */
    let retryCount = 0;

    /** Maximum number of allowed retries for failed event fetches. */
    const maxRetries = 3;

    /** Automatically load artist events when the component mounts. */
    onMount(loadArtistEvents);

    /**
     * Fetches the events associated with the given artist.
     * Updates `events`, `isLoadingEvents`, and `error` states accordingly.
     */
    async function loadArtistEvents() {
        try {
            isLoadingEvents = true;
            error = null;
            events = await artistService.getArtistEvents(artist.id);
        } catch (err) {
            error = err instanceof Error ? err.message : "Impossible de charger les événements.";
        } finally {
            isLoadingEvents = false;
        }
    }

    /**
     * Retries fetching the artist events if the maximum retry count
     * has not been reached.
     */
    async function retryLoadEvents() {
        if (retryCount < maxRetries) {
            retryCount++;
            await loadArtistEvents();
        }
    }

    /** First 3 events displayed in the card. */
    $: displayedEvents = events.slice(0, 3);

    /** Number of events not displayed in the preview list. */
    $: additionalEvents = Math.max(0, events.length - 3);

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
    id={"artist-" + artist.id}
    title={artist.label}
    linkHref={`/artists/${artist.id}`}
    linkLabel="Voir plus"
    badgeCount={!isLoadingEvents && !error ? events.length : null}
    {animationDelay}
    {isLoading}
>
    <div slot="content">
        {#if isLoadingEvents}
            <div class="artist-loading">
                <div class="loading-spinner"></div>
                <span>Chargement des événements...</span>
            </div>
        {:else if error}
            <div class="artist-error" role="alert">
                <p class="error-message">{error}</p>
                {#if retryCount < maxRetries}
                    <button class="retry-button" on:click={retryLoadEvents}>
                        Réessayer
                    </button>
                {/if}
            </div>
        {:else if events.length > 0}
            <div class="card-section">
                <h3 class="card-section-title">Événements associés</h3>
                <ul class="linked-informations">
                    {#each displayedEvents as event (event.id)}
                        <li class="event-item">
                            <a href={`/events/${event.id}`} class="event-details">
                                <span class="related-item-label">{event.label}</span>
                                <time class="event-dates" datetime={event.startDate}>
                                    {formatEventDates(event)}
                                </time>
                            </a>
                        </li>
                    {/each}

                    {#if additionalEvents > 0}
                        <li class="additional-information">
                            <span class="additional-count">
                                +{additionalEvents} autre{additionalEvents > 1 ? "s" : ""} événement{additionalEvents > 1 ? "s" : ""}
                            </span>
                        </li>
                    {/if}
                </ul>
            </div>
        {:else}
            <div class="no-information">
                <p>Aucun événement associé pour le moment.</p>
            </div>
        {/if}
    </div>
</CardBase>

<style>
    @import '../styles/card.css';

    /* Loading state */
    .card.loading {
        opacity: 0.7;
        pointer-events: none;
    }

    .artist-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        color: #6b7280;
        font-size: 0.875rem;
        padding: 1rem 0;
    }

    .loading-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Error state */
    .artist-error {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: #fef2f2;
        border-radius: 8px;
        border: 1px solid #fecaca;
    }

    .error-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    .error-content {
        flex: 1;
    }

    .error-message {
        margin: 0 0 0.5rem 0;
        color: #dc2626;
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .retry-button {
        background: #dc2626;
        color: white;
        border: none;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .retry-button:hover {
        background: #b91c1c;
    }

    .event-item {
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: background-color 0.2s;
    }

    .event-item:hover {
        background: #f1f5f9;
    }

    .event-details {
        text-decoration: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .additional-count {
        font-size: 0.8125rem;
        color: #6b7280;
        font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .event-details {
            gap: 0.125rem;
        }
    }
</style>
<script lang="ts">
    import { onMount } from "svelte";
    import type { Artist, Event } from "$lib/core";
    import { createArtistService } from "$lib/core";
    import { useEventDates } from "$lib/hooks";
    import CardBase from "$lib/components/shared/cards/CardBase.svelte";

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

    const { formatEventDates } = useEventDates();

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
            <div class="state-loading">
                <div class="loading-spinner"></div>
                <span>Chargement des événements...</span>
            </div>
        {:else if error}
            <div class="state-error" role="alert">
                <p class="error-message">{error}</p>
                {#if retryCount < maxRetries}
                    <button class="retry-btn" on:click={retryLoadEvents}>
                        Réessayer
                    </button>
                {/if}
            </div>
        {:else if events.length === 0}
            <div class="no-information">
                <p>Aucun événement associé pour le moment.</p>
            </div>
        {:else}
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
        {/if}
    </div>
</CardBase>

<style>
    @import "$lib/styles/cards/cards.shared.css";
    @import "$lib/styles/states/states.shared.css";

    /* Event item */
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

    /* Responsive */
    @media (max-width: 768px) {
        .event-details {
            gap: 0.125rem;
        }
    }
</style>
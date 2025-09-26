<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import type { Artist, Event } from '../types/pagination';
	import { createArtistService } from '../services/artist.service';
	import { DateFormatterFactory } from '../utils/formatters';
	import { onMount } from 'svelte';

	/**
	 * The artist object to display in the card.
	 * Must conform to the Artist interface.
	 */
	export let artist: Artist;

	/**
	 * Indicates whether the parent component is in a loading state.
	 * This affects the card's visual opacity and interactivity.
	 */
	export let isLoading = false;

	/**
	 * Delay (in milliseconds) applied to the CSS animation
	 * for staggered list appearance.
	 */
	export let animationDelay = 0;

	/** Events linked to the current artist. */
	let events: Event[] = [];

	/** Loading state for events fetching. */
	let isLoadingEvents = true;

	/**
	 * Error message in case fetching fails.
	 * Null if no error occurred.
	 */
	let error: string | null = null;

	/** Retry counter for fetching events. */
	let retryCount = 0;

	/** Maximum number of retries allowed for fetching events. */
	const maxRetries = 3;

	/** Service instance for retrieving artist-related data. */
	const artistService = createArtistService();

	/**
	 * Date formatter instance used to format event dates.
	 * Defaults to a French locale formatter.
	 */
	const dateFormatter = DateFormatterFactory.getFrenchFormatter();

	/**
	 * Fetches the list of events associated with the artist.
	 * Updates `events`, `isLoadingEvents`, and `error` states accordingly.
	 */
	onMount(async () => {
		await loadArtistEvents();
	});

    /**
	 * Attempts to load artist events from the API.
	 * Handles success, error, and loading states.
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
	 * Retries loading events if the retry limit has not been reached.
	 */
	async function retryLoadEvents() {
		if (retryCount < maxRetries) {
			retryCount++;
			await loadArtistEvents();
		}
	}

	/** Subset of events limited to a maximum of 3 for display. */
	$: displayedEvents = events.slice(0, 3);

	/** Number of additional events beyond the displayed subset. */
	$: additionalEvents = events.length > 3 ? events.length - 3 : 0;

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
	Displays the artist title, date(s), associated events, 
	and a link to the artist detail page. 
-->
<li
    id={`artist-${artist.id}`}
    class="card"
	class:loading={isLoading}
	style="animation-delay: {animationDelay}ms"
	aria-labelledby="artist-name-{artist.id}"
>
	<header class="card-header">
		<h2 id="artist-name-{artist.id}" class="card-title">
			{artist.label}
		</h2>
		
		{#if !isLoadingEvents && !error && events.length > 0}
			<div class="badge" title="{events.length} événement{events.length > 1 ? 's' : ''}">
				{events.length}
			</div>
		{/if}
	</header>

	<div class="card-content">
		<!-- Artists section -->
		{#if isLoadingEvents}
			<div class="artist-loading" aria-live="polite">
				<div class="loading-spinner"></div>
				<span>Chargement des événements...</span>
			</div>
		{:else if error}
			<div class="artist-error" role="alert">
				<div class="error-icon">⚠️</div>
				<div class="error-content">
					<p class="error-message">{error}</p>
					{#if retryCount < maxRetries}
						<button 
							class="retry-button"
							on:click={retryLoadEvents}
							aria-label="Réessayer de charger les événements"
						>
							Réessayer
						</button>
					{/if}
				</div>
			</div>
		<!-- Badge showing the number of associated events -->
		{:else if events.length > 0}
			<div class="card-section">
				<h3 class="card-section-title">Événements associés</h3>
				<ul id="linked-informations">
					{#each displayedEvents as event (event.id)}
						<li class="event-item">
                            <a
								href={`/events/${event.id}`}
								class="event-details"
								aria-label="Voir la fiche de l'événement {event.label}"
							>
								<span class="related-item-label">{event.label}</span>

                                <!-- Event date(s) -->
								<time class="event-dates" datetime="{event.startDate}">
									{formatEventDates(event)}
								</time>
							</a>
						</li>
					{/each}
					<!-- Summary for additional events -->
					{#if additionalEvents > 0}
						<li class="additional-information">
							<span class="additional-count">
								+{additionalEvents} autre{additionalEvents > 1 ? 's' : ''} événement{additionalEvents > 1 ? 's' : ''}
							</span>
						</li>
					{/if}
				</ul>
			</div>
		{:else}
			<!-- Empty state when no events are linked -->
			<div class="no-information">
				<p>Aucun événement associé pour le moment.</p>
			</div>
		{/if}
	</div>

	<footer class="card-footer">
		<!-- Link to artist details page -->
		<a
			href="/artists/{artist.id}"
			class="card-link"
			aria-label="Voir les détails de {artist.label}"
		>
			<span>Voir plus</span>
			<ArrowRight size={16} />
		</a>
	</footer>
</li>

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
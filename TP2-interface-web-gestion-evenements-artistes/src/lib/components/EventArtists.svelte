<script lang="ts">
	import type { Event, Artist } from '../types/pagination';
	import { createEventService } from '../services/event.service';
	import { createArtistService } from '../services/artist.service';
	import { notifications } from '../stores/notification.store';

	/**
	 * Event object passed as a prop.
	 * Contains event details and associated artists.
	 */
	export let event: Event;

	/** Instance of EventService to handle event-related API calls */
	const eventService = createEventService();
	/** Instance of ArtistService to handle artist-related API calls */
	const artistService = createArtistService();

	/** Stores the ID of the new artist to add */
	let newArtistId = '';
	/** Indicates if a request is currently in progress */
	let isLoading = false;

	/**
	 * Adds an artist to the current event.
	 *
	 * - Validates the entered artist ID.
	 * - Fetches the artist details from the API.
	 * - Adds the artist to the event via EventService.
	 * - Updates the local `event.artists` array.
	 * - Displays success or error notifications.
	 */
	async function addArtist() {
		const id = newArtistId.trim();
		if (!id) return;

		await performAction(async () => {
			const artist = await artistService.getArtistById(id);
			if (!artist) {
				notifications.error("L'artiste n'existe pas");
				return;
			}

			await eventService.addArtistToEvent(event.id, id);
			updateArtistsList(artist, 'add');

			notifications.success("L'artiste a été ajouté avec succès");
			newArtistId = '';
		}, 'Impossible d\'ajouter l\'artiste');
	}

	/**
	 * Removes an artist from the current event.
	 *
	 * - Calls EventService to remove the artist association.
	 * - Updates the local `event.artists` array.
	 * - Displays success or error notifications.
	 *
	 * @param artist - Artist object to remove
	 */
	async function removeArtist(artist: Artist) {
		await performAction(async () => {
			await eventService.removeArtistFromEvent(event.id, artist.id);
			updateArtistsList(artist, 'remove');

			notifications.success('L\'artiste a été supprimé avec succès');
		}, 'Impossible de supprimer l\'artiste');
	}

	/**
	 * Wrapper function to centralize loading state and error handling.
	 *
	 * - Sets `isLoading` to true before executing the action.
	 * - Catches any errors and displays a notification with `errorMsg`.
	 * - Resets `isLoading` to false after completion.
	 *
	 * @param action - Async function to execute
	 * @param errorMsg - Error message to display if action fails
	 */
	async function performAction(action: () => Promise<void>, errorMsg: string) {
		isLoading = true;
		try {
			await action();
		} catch (e) {
			notifications.error(errorMsg);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Updates the local `event.artists` array after an add or remove operation.
	 *
	 * @param artist - Artist object to add or remove
	 * @param action - "add" to append the artist, "remove" to filter out the artist
	 */
	function updateArtistsList(artist: Artist, action: 'add' | 'remove') {
		if (action === 'add') {
			event.artists = [...(event.artists ?? []), artist];
		} else {
			event.artists = event.artists?.filter(a => a.id !== artist.id) ?? [];
		}
	}
</script>

<section id="event-artists-section" class="event-artists-container">
	<h2 class="event-artists-title">Artiste(s) associé.e(s)</h2>

	{#if event.artists?.length}
		<ul id="artist-list" class="artist-list">
			{#each event.artists as artist}
				<li class="artist-item" id={`artist-${artist.id}`}>
					<span class="artist-label">{artist.label}</span>
					<button
						class="artist-remove-btn"
						on:click={() => removeArtist(artist)}
						disabled={isLoading}
						aria-label={`Supprimer l'artiste ${artist.label}`}
					>
						Supprimer
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="artist-empty">Aucun artiste</p>
	{/if}

	<form id="artist-form" class="artist-form" on:submit|preventDefault={addArtist}>
		<label for="artistId" class="artist-form-label">Ajouter un artiste</label>
		<input
			id="artistId"
			class="artist-form-input"
			placeholder="L'ID de l'artiste"
			bind:value={newArtistId}
			required
		/>
		<button type="submit" class="artist-form-submit" disabled={isLoading}>
			Ajouter
		</button>
	</form>
</section>

<style>
/* === Container === */
#event-artists-section {
	background-color: #fdfdfd;
	border: 1px solid #e0e0e0;
	border-radius: 12px;
	padding: 2rem;
	max-width: 600px;
	margin: 2rem auto;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	transition: box-shadow 0.3s ease, opacity 0.3s ease;
}

/* === Heading === */
.event-artists-title {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: 1.5rem;
	color: #2c3e50;
	text-align: center;
}

/* === Artist List === */
#artist-list {
	list-style: none;
	padding: 0;
	margin-bottom: 1.5rem;
}

.artist-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #f8f9fa;
	border: 1px solid #ddd;
	border-radius: 6px;
	padding: 0.75rem 1rem;
	margin-bottom: 0.5rem;
	transition: background-color 0.3s ease;
}

.artist-item:hover {
	background-color: #eef2f5;
}

.artist-label {
	font-weight: 500;
	color: #2c3e50;
}

/* === Empty State === */
.artist-empty {
	font-size: 0.95rem;
	color: #7f8c8d;
	text-align: center;
	margin-bottom: 1.5rem;
}

/* === Form === */
#artist-form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	transition: opacity 0.3s ease;
}

.artist-form-label {
	font-weight: 500;
	color: #34495e;
}

.artist-form-input {
	padding: 0.6rem 0.75rem;
	border: 1px solid #ccc;
	border-radius: 6px;
	font-size: 1rem;
	box-sizing: border-box;
	transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.artist-form-input:focus {
	border-color: #3498db;
	box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
	outline: none;
}

/* === Buttons === */
.artist-remove-btn,
.artist-form-submit {
	background-color: #3498db;
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.3s ease, transform 0.2s ease;
}

.artist-remove-btn {
	padding: 0.6rem 1rem;
	margin-left: 1rem;
}

.artist-form-submit {
	padding: 0.75rem 1.25rem;
	align-self: flex-start;
}

.artist-remove-btn:hover:not(:disabled),
.artist-form-submit:hover:not(:disabled) {
	background-color: #2980b9;
}

.artist-remove-btn:disabled,
.artist-form-submit:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>
<script lang="ts">
	import type { Event, Artist } from '../types/pagination';
	import { createEventService } from '../services/event.service';
	import { createArtistService } from '../services/artist.service';
    import { notifications } from '../stores/notification.store';

	export let event: Event;

	const eventService = createEventService();
	const artistService = createArtistService();

	let newArtistId = '';
	let isLoading = false;

	async function addArtist() {
		const id = newArtistId.trim();
		if (!id) return;

		isLoading = true;

		try {
			const artist: Artist = await artistService.getArtistById(id);
			if (!artist) {
        		notifications.error('Artiste introuvable');
			}

			await eventService.addArtistToEvent(event.id, id);
			event.artists = [...(event.artists ?? []), artist];

    		notifications.success('Artiste ajouté avec succès');
			newArtistId = '';
		} catch (e) {
    		notifications.error('Impossible d’ajouter l’artiste');
		} finally {
			isLoading = false;
		}
	}

	async function removeArtist(artist: Artist) {
		isLoading = true;

		try {
			await eventService.removeArtistFromEvent(event.id, artist.id);
			event.artists = event.artists.filter(a => a.id !== artist.id);

    		notifications.success('Artiste supprimé avec succès');
		} catch (e) {
    		notifications.error('Impossible de retirer l’artiste');
		} finally {
			isLoading = false;
		}
	}
</script>

<section id="event-artists-section" class="event-artists-container">
    <h2 class="event-artists-title">Artistes associés</h2>

    {#if event.artists && event.artists.length > 0}
        <ul id="artist-list" class="artist-list">
            {#each event.artists as artist}
                <li class="artist-item" id={`artist-${artist.id}`}>
                    <span class="artist-label">{artist.label}</span>
                    <button
                        class="artist-remove-btn"
                        on:click={() => removeArtist(artist)}
                        disabled={isLoading}
                        aria-label="Supprimer l’artiste {artist.label}"
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
            placeholder="ID de l’artiste"
            bind:value={newArtistId}
            required
        />
        <button
            type="submit"
            class="artist-form-submit"
            disabled={isLoading}
        >
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
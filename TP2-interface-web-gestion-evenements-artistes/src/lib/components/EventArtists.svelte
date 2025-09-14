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
				throw new Error('Artiste introuvable');
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

<section>
	<h2>Artistes associés</h2>

	{#if event.artists && event.artists.length > 0}
		<ul>
			{#each event.artists as artist}
				<li>
					{artist.label}
					<button
                      on:click={() => removeArtist(artist)}
                      disabled={isLoading}
                    >
						Supprimer
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Aucun artiste</p>
	{/if}

	<form on:submit|preventDefault={addArtist}>
		<label for="artistId">Ajouter un artiste</label>
		<input
          id="artistId"
          placeholder="ID de l’artiste"
          bind:value={newArtistId}
          required
        />
		<button type="submit" disabled={isLoading}>Ajouter</button>
	</form>
</section>
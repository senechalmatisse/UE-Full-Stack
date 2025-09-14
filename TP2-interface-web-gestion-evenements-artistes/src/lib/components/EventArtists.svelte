<script lang="ts">
	import type { Event, Artist } from '../types/pagination';
	import { createEventService } from '../services/event.service';

	export let event: Event;

	const eventService = createEventService();
	let newArtistId = '';
	let errorMessage: string | null = null;
	let isLoading = false;

	async function addArtist() {
		if (!newArtistId.trim()) return;
		isLoading = true;
		errorMessage = null;

		try {
			await eventService.addArtistToEvent(event.id, newArtistId);
			// simulate fetch updated artist
			event.artists = [...event.artists, { id: newArtistId, label: `Artiste ${newArtistId}` }];
			newArtistId = '';
		} catch (e) {
			errorMessage = 'Impossible d’ajouter l’artiste';
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	async function removeArtist(artist: Artist) {
		isLoading = true;
		errorMessage = null;

		try {
			await eventService.removeArtistFromEvent(event.id, artist.id);
			event.artists = event.artists.filter(a => a.id !== artist.id);
		} catch (e) {
			errorMessage = 'Impossible de retirer l’artiste';
			console.error(e);
		} finally {
			isLoading = false;
		}
	}
</script>

<section>
	<h2>Artistes associés</h2>

	{#if event.artists.length > 0}
		<ul>
			{#each event.artists as artist}
				<li>
					{artist.label}
					<button on:click={() => removeArtist(artist)} disabled={isLoading}>
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
		<input id="artistId" placeholder="ID de l’artiste" bind:value={newArtistId} />
		<button type="submit" disabled={isLoading}>Ajouter</button>
	</form>

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
</section>

<style>
	.error { color: red; }
</style>
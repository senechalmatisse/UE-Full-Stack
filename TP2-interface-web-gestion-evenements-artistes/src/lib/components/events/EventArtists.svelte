<script lang="ts">
    import type { Event, Artist } from '$lib/types/pagination';
    import { createEventService } from '$lib/services/event.service';
    import { createArtistService } from '$lib/services/artist.service';
    import AssociationManager from '../managers/AssociationManager.svelte';
    import { AppError } from '$lib/services/api.error';

    export let event: Event;

    const eventService = createEventService();
    const artistService = createArtistService();

    async function addArtist(id: string) {
        const artist = await artistService.getById('/artists', id);
        if (!artist)  throw new AppError(404, "Artiste introuvable");

        await eventService.addArtistToEvent(event.id, artist.id);
        return artist;
    }

    async function removeArtist(artist: Artist) {
        await eventService.removeArtistFromEvent(event.id, artist.id);
    }
</script>

<AssociationManager
    title="Artiste(s) associé.e(s)"
    emptyLabel="Aucun artiste"
    inputLabel="Ajouter un artiste"
    inputPlaceholder="L'ID de l'artiste"
    confirmAddMsg="Voulez-vous ajouter cet(te) artiste ?"
    confirmRemoveMsg="Retirer cet(te) artiste de cet événement ?"
    successAddMsg="L'artiste a été ajouté.e avec succès"
    successRemoveMsg="L'artiste a été supprimé.e avec succès"
    errorAddMsg="Impossible d'ajouter l'artiste"
    errorRemoveMsg="Impossible de supprimer l'artiste"
    onAdd={addArtist}
    onRemove={removeArtist}
    bind:items={event.artists}
/>
<script lang="ts">
    import type { Event, Artist } from '$lib/core';
    import { createEventService, createArtistService, AppError } from '$lib/core';
    import AssociationManager from '$lib/components/managers/AssociationManager.svelte';

    /**
     * EventArtists Component
     *
     * This component manages the association between a specific event and multiple artists.
     * It allows:
     * - Displaying artists currently associated with the event
     * - Adding new artists to the event (from available artists)
     * - Removing existing artists from the event
     */

    /**
     * The event for which associated artists are being managed.
     */
    export let event: Event;

    /** Service instance for event-related operations */
    const eventService = createEventService();

    /** Service instance for artist-related operations */
    const artistService = createArtistService();

    /**
     * Fetches all available artists from the API.
     * @returns A list of all artists in the system.
     */
    async function fetchAvailableArtists(): Promise<Artist[]> {
        try {
            const response = await artistService.getAll('/artists', { 
                page: 0, 
                size: 1000 
            });
            return response.content;
        } catch (err) {
            console.error('Failed to fetch artists:', err);
            return [];
        }
    }

    /**
     * Adds an artist to the current event.
     */
    async function addArtist(id: string) {
        const artist = await artistService.getById('/artists', id);
        if (!artist) throw new AppError(404, "Artiste introuvable");

        await eventService.addArtistToEvent(event.id, artist.id);
        return artist;
    }

    /**
     * Removes an artist from the current event.
     */
    async function removeArtist(artist: Artist) {
        await eventService.removeArtistFromEvent(event.id, artist.id);
    }
</script>

<AssociationManager
    title="Artiste(s) associé.e(s)"
    emptyLabel="Aucun artiste"
    inputLabel="Ajouter un artiste"
    inputPlaceholder="Sélectionnez un artiste"
    messages={{
        confirmAdd: "Voulez-vous ajouter cet(te) artiste ?",
        confirmRemove: "Retirer cet(te) artiste de cet événement ?",
        successAdd: "L'artiste a été ajouté.e avec succès",
        successRemove: "L'artiste a été supprimé.e avec succès",
        errorAdd: "Impossible d'ajouter l'artiste",
        errorRemove: "Impossible de supprimer l'artiste"
    }}
    onAdd={addArtist}
    onRemove={removeArtist}
    onFetchAvailable={fetchAvailableArtists}
    bind:items={event.artists}
/>
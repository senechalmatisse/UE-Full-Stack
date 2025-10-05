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
     * - Adding new artists to the event
     * - Removing existing artists from the event
     *
     * It delegates UI rendering and list management to the `AssociationManager` component.
     *
     * @example
     * <EventArtists
     *   event={selectedEvent}
     * />
     */

    /**
     * The event for which associated artists are being managed.
     * The `artists` property of this object is two-way bound (`bind:items`),
     * so the list updates automatically when artists are added or removed.
     */
    export let event: Event;

    /** Service instance for event-related operations */
    const eventService = createEventService();

    /** Service instance for artist-related operations */
    const artistService = createArtistService();

    /**
     * Adds an artist to the current event.
     *
     * - Fetches the artist by ID
     * - Throws an error if the artist does not exist
     * - Associates the artist with the event
     *
     * @param id - The identifier of the artist to be added.
     * @returns The artist object once successfully associated with the event.
     * @throws AppError if the artist cannot be found or if the operation fails.
     */
    async function addArtist(id: string) {
        const artist = await artistService.getById('/artists', id);
        if (!artist)  throw new AppError(404, "Artiste introuvable");

        await eventService.addArtistToEvent(event.id, artist.id);
        return artist;
    }

    /**
     * Removes an artist from the current event.
     *
     * @param artist - The artist to be removed from the event.
     * @returns A promise that resolves once the removal is completed.
     */
    async function removeArtist(artist: Artist) {
        await eventService.removeArtistFromEvent(event.id, artist.id);
    }
</script>

<AssociationManager
    title="Artiste(s) associé.e(s)"
    emptyLabel="Aucun artiste"
    inputLabel="Ajouter un artiste"
    inputPlaceholder="L'ID de l'artiste"
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
    bind:items={event.artists}
/>
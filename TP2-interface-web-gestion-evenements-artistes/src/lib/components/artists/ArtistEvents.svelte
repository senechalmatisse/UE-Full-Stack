<script lang="ts">
    import type { Artist, Event } from '$lib/core';
    import { createEventService, AppError } from '$lib/core';
    import AssociationManager from '$lib/components/managers/AssociationManager.svelte';

    /**
     * ArtistEvents Component
     *
     * This component manages the association between a specific artist and multiple events.
     * It allows:
     * - Displaying currently associated events
     * - Adding the artist to new events
     * - Removing the artist from existing events
     *
     * Internally, it delegates UI rendering and interaction to the `AssociationManager` component.
     *
     * @example
     * <ArtistEvents
     *   artist={artist}
     *   events={artistEvents}
     * />
     */

    /** The artist for whom events are being managed. */
    export let artist: Artist;

    /**
     * The list of events currently associated with the artist.
     * This list is two-way bound (`bind:items`) so it updates automatically
     * when events are added or removed.
     */
    export let events: Event[];

    /** Service instance providing event-related API operations */
    const eventService = createEventService();

    /**
     * Adds the current artist to an event.
     *
     * @param id - The identifier of the event to which the artist should be added.
     * @returns The updated event object after the association is created.
     * @throws AppError if the event cannot be found or the operation fails.
     */
    async function addEvent(id: string) {
        await eventService.addArtistToEvent(id, artist.id);
        const updated = await eventService.getById('/events', id);
        if (!updated) throw new AppError(404, "Événement introuvable");
        return updated;
    }

    /**
     * Removes the current artist from a given event.
     *
     * @param item - An object containing the event ID and label.
     * @returns A promise that resolves when the artist is successfully removed.
     */
    async function removeEvent(item: { id: string; label: string }) {
        await eventService.removeArtistFromEvent(item.id, artist.id);
    }
</script>

<AssociationManager
    title="Événement(s) associé(s)"
    emptyLabel="Aucun événement"
    inputLabel="Ajouter un événement"
    inputPlaceholder="L'ID de l'événement"
    messages={{
        confirmAdd: "Voulez-vous ajouter cet événement ?",
        confirmRemove: "Retirer cet événement de cet(te) artiste ?",
        successAdd: "Événement ajouté avec succès",
        successRemove: "Événement supprimé avec succès",
        errorAdd: "Impossible d'ajouter l'événement",
        errorRemove: "Impossible de supprimer l'événement"
    }}
    onAdd={addEvent}
    onRemove={removeEvent}
    bind:items={events}
/>
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
     * - Adding the artist to new events (from available events)
     * - Removing the artist from existing events
     */

    /** The artist for whom events are being managed. */
    export let artist: Artist;

    /**
     * The list of events currently associated with the artist.
     */
    export let events: Event[];

    /** Service instance providing event-related API operations */
    const eventService = createEventService();

    /**
     * Fetches all available events from the API.
     * @returns A list of all events in the system.
     */
    async function fetchAvailableEvents(): Promise<Event[]> {
        try {
            const response = await eventService.getAll('/events', { 
                page: 0, 
                size: 1000 
            });
            return response.content;
        } catch (err) {
            console.error('Failed to fetch events:', err);
            return [];
        }
    }

    /**
     * Adds the current artist to an event.
     */
    async function addEvent(id: string) {
        await eventService.addArtistToEvent(id, artist.id);
        const updated = await eventService.getById('/events', id);
        if (!updated) throw new AppError(404, "Événement introuvable");
        return updated;
    }

    /**
     * Removes the current artist from a given event.
     */
    async function removeEvent(item: { id: string; label: string }) {
        await eventService.removeArtistFromEvent(item.id, artist.id);
    }
</script>

<AssociationManager
    title="Événement(s) associé(s)"
    emptyLabel="Aucun événement"
    inputLabel="Ajouter un événement"
    inputPlaceholder="Sélectionnez un événement"
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
    onFetchAvailable={fetchAvailableEvents}
    bind:items={events}
/>
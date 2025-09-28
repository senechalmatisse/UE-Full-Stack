<script lang="ts">
    import type { Artist, Event } from '$lib/types/pagination';
    import { createEventService } from '$lib/services/event.service';
    import AssociationManager from '../managers/AssociationManager.svelte';
    import { AppError } from '$lib/services/api.error';

    export let artist: Artist;
    export let events: Event[];

    const eventService = createEventService();

    async function addEvent(id: string) {
        await eventService.addArtistToEvent(id, artist.id);
        const updated = await eventService.getById('/events', id);
        if (!updated) throw new AppError(404, "Événement introuvable");
        return updated;
    }

    async function removeEvent(item: { id: string; label: string }) {
        await eventService.removeArtistFromEvent(item.id, artist.id);
    }
</script>

<AssociationManager
    title="Événement(s) associé(s)"
    emptyLabel="Aucun événement"
    inputLabel="Ajouter un événement"
    inputPlaceholder="L'ID de l'événement"
    confirmAddMsg="Voulez-vous ajouter cet événement ?"
    confirmRemoveMsg="Retirer cet événement de cet(te) artiste ?"
    successAddMsg="Événement ajouté avec succès"
    successRemoveMsg="Événement supprimé avec succès"
    errorAddMsg="Impossible d'ajouter l'événement"
    errorRemoveMsg="Impossible de supprimer l'événement"
    onAdd={addEvent}
    onRemove={removeEvent}
    bind:items={events}
/>
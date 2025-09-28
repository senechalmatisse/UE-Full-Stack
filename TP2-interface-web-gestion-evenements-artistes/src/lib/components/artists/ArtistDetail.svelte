<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import EditableForm from "$lib/components/shared/forms/EditableForm.svelte";
    import type { Artist } from "$lib/types/pagination";
    import { createArtistService } from "$lib/services/artist.service";
    import { AppError } from "$lib/services/api.error";

    /**
     * ArtistDetail Component
     *
     * This component displays and allows editing of an artist's details.
     * It provides a form for updating the artist's label (name) and persists changes
     * using the `artistService`. On successful update, it emits an `updated` event
     * containing the new artist data.
     *
     * Features:
     * - Editable form with validation.
     * - Local synchronization of the updated artist data.
     * - Error handling with clear validation and API error messages.
     * - Event dispatching to notify parent components about updates.
     *
     * @example
     * <ArtistDetail
     *   artist={artist}
     *   on:updated={(event) => console.log("Artist updated:", event.detail)}
     * />
     */

    /**
     * The artist object containing the current details.
     * This data is preloaded and editable within the form.
     */
    export let artist: Artist;

    /** Artist API service instance for CRUD operations. */
    const artistService = createArtistService();

    /**
     * Dispatches custom events to parent components.
     * Currently supports:
     * - `updated`: Fired when the artist is successfully updated.
     */
    const dispatch = createEventDispatcher<{ updated: Artist }>();

    /**
     * Local state for the editable artist label.
     * Initialized with the provided `artist.label`.
     */
    let artistLabel = artist.label;

    /**
     * Saves the updated artist information.
     *
     * - Validates that the label has at least 3 characters.
     * - Calls the API service to update the artist.
     * - Updates the local state with the new data.
     * - Dispatches an `updated` event to notify parent components.
     *
     * @throws {AppError} If validation fails or API update is unsuccessful.
     * @returns {Promise<Artist>} The updated artist object.
     */
    async function saveArtist() {
        if (artistLabel.trim().length < 3) {
            throw new AppError(400, "Le nom doit contenir au moins 3 caractères");
        }

        const updated = await artistService.update("/artists", artist.id, {
            label: artistLabel,
        });

        if (!updated) throw new AppError(500, "Échec lors de la mise à jour de l'artiste");

        // Update local state
        artist = updated;
        artistLabel = updated.label;

        // Notify parent component
        dispatch("updated", updated);

        return updated;
    }
</script>

<EditableForm
    title="Informations sur l’artiste"
    onSave={saveArtist}
    successMessage="Artiste mis à jour avec succès"
>
    <div class="form-row">
        <label for="label">Nom</label>
        <input id="label" bind:value={artistLabel} />
    </div>
</EditableForm>

<style>
    /* === Form Fields === */
    .form-row {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    label {
        font-weight: 500;
        margin-bottom: 0.4rem;
        color: #34495e;
    }

    input {
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    input:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
    }
</style>
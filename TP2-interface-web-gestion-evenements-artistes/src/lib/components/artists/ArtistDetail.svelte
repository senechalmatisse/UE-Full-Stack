<script lang="ts">
	import type { Artist } from "$lib/core";
    import { useEntityEditor } from "$lib/hooks";
    import { createArtistService } from "$lib/core";
    import EditableForm from "$lib/components/shared/forms/EditableForm.svelte";

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

    const { saveEntity } = useEntityEditor({
        entity: artist,
        service: artistService,
        endpoint: "/artists"
    });

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
    async function saveArtist(): Promise<Artist> {
        const updated = await saveEntity({ label: artistLabel });
        artist = updated;
        artistLabel = updated.label;
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
    @import "$lib/styles/forms/forms.base.css";
    @import "$lib/styles/forms/forms.fields.css";
</style>
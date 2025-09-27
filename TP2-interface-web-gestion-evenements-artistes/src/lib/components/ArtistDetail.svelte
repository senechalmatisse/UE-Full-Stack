<script lang="ts">
    import EditableForm from "./EditableForm.svelte";
    import type { Artist } from "$lib/types/pagination";
    import { createArtistService } from "$lib/services/artist.service";
    import { createEventDispatcher } from "svelte";
    import { AppError } from "$lib/services/api.error";

    export let artist: Artist;

    const artistService = createArtistService();
    const dispatch = createEventDispatcher<{ updated: Artist }>();

    let artistLabel = artist.label;

    async function saveArtist() {
        if (artistLabel.trim().length < 3) {
            throw new AppError(400, "Le nom doit contenir au moins 3 caractères");
        }

        const updated = await artistService.update("/artists", artist.id, {
            label: artistLabel,
        });

        if (!updated) throw new AppError(500, "Échec lors de la mise à jour de l'artiste");

        // synchro locale
        artist = updated;
        artistLabel = updated.label;

        // dispatch vers le parent (+page.svelte)
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
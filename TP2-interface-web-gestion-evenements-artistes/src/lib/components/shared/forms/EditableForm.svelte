<script lang="ts">
    import { useSaveAction } from "$lib/hooks/useSaveAction";

    export let title: string;
    export let onSave: () => Promise<any>;
    export let successMessage: string;

    const { isSaving, run } = useSaveAction(successMessage);

    async function handleSubmit() {
        await run(onSave);
    }
</script>

<section class:is-saving={$isSaving}>
    <h2>{title}</h2>

    <form on:submit|preventDefault={handleSubmit} class:is-saving={$isSaving}>
        <slot />

        <button type="submit" disabled={$isSaving} class="submit-btn">
            {$isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
    </form>
</section>

<style>
    /* === Container === */
    section {
        background-color: #fdfdfd;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        margin: 2rem auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease, opacity 0.3s ease;
    }

    section.is-saving {
        opacity: 0.6;
        box-shadow: none;
    }

    /* === Headings & Dates === */
    h2 {
        font-size: 1.6rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #2c3e50;
        text-align: center;
    }

    /* === Form === */
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: opacity 0.3s ease;
    }

    form.is-saving {
        opacity: 0.6;
        pointer-events: none;
    }

    /* === Submit Button === */
    .submit-btn {
        background-color: #3498db;
        color: white;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        align-self: flex-start;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: #2980b9;
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
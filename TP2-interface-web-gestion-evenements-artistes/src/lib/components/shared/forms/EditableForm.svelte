<script lang="ts">
    import { useSaveAction } from "$lib/hooks/useSaveAction";

    /**
     * EditableForm component.
     *
     * A reusable form wrapper that provides:
     * - A title heading
     * - A slot for custom form fields
     * - A submit button with built-in loading state
     * - Automatic success notification handling via `useSaveAction`
     *
     * @example
     * ```svelte
     * <EditableForm
     *   title="Edit Event"
     *   onSave={async () => await saveEvent(data)}
     *   successMessage="Event saved successfully!"
     * >
     *   <input type="text" placeholder="Event title" />
     *   <input type="date" />
     * </EditableForm>
     * ```
     */

    /** Title displayed at the top of the form. */
    export let title: string;

    /**
     * Callback executed when the form is submitted.
     * Must return a Promise (e.g., API call or async action).
     */
    export let onSave: () => Promise<any>;

    /** Success message shown after a successful save action. */
    export let successMessage: string;

    /** Loading state and runner function from the save action hook. */
    const { isSaving, run } = useSaveAction(successMessage);

    /**
     * Handles form submission.
     *
     * Prevents the default submit behavior and executes
     * the `onSave` callback through `useSaveAction`.
     */
    async function handleSubmit() {
        await run(onSave);
    }
</script>

<section class:is-saving={$isSaving}>
    <h2>{title}</h2>

    <form on:submit|preventDefault={handleSubmit} class:is-saving={$isSaving}>
        <!-- Slot for custom form fields -->
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

    /* === Heading === */
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
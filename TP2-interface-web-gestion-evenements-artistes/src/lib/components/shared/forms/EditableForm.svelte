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
    @import "$lib/styles/forms/forms.base.css";
</style>
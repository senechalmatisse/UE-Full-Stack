import { writable } from "svelte/store";
import { createEventDispatcher } from "svelte";
import { notifications } from "$lib/stores/notification.store";
import { AppError } from "$lib/services/api.error";

/**
 * Hook to handle save/update actions with consistent state management,
 * user notifications, and event dispatching.
 *
 * Provides a reactive `isSaving` store and a `run` function
 * that executes an async save action with built-in error handling.
 *
 * @template T - The type of the saved/updated entity.
 *
 * @param successMessage - The message displayed when the save succeeds.
 * @returns An object containing:
 * - `isSaving`: A writable store indicating whether a save action is in progress.
 * - `run`: A function to execute the save action.
 *
 * @example
 * ```ts
 * const { isSaving, run } = useSaveAction<User>("Profile updated successfully!");
 *
 * async function saveProfile() {
 *   await run(async () => {
 *     return await api.updateUser(profileData);
 *   });
 * }
 * ```
 */
export function useSaveAction<T = any>(successMessage: string) {
    const isSaving = writable(false);
    const dispatch = createEventDispatcher<{ updated: T }>();

    /**
     * Executes the provided save action with notifications and error handling.
     *
     * @param action - An async function that performs the save and returns the updated entity, or `null` on failure.
     * @returns The updated entity of type {@link T}, or `null` if the action fails.
     *
     * @throws {AppError} If the action does not return a valid entity.
     */
    async function run(action: () => Promise<T | null>) {
        isSaving.set(true);

        notifications.info("Sauvegarde en cours...");

        try {
            const updated = await action();
            if (!updated) throw new AppError(500, "Mise à jour échouée");

            dispatch("updated", updated);
            notifications.success(successMessage);

            return updated;
        } catch (err) {
            notifications.error(
                err instanceof AppError ? err.message : "Erreur lors de la mise à jour"
            );
            return null;
        } finally {
            isSaving.set(false);
        }
    }

    return { isSaving, run };
}
import { writable } from "svelte/store";
import { createEventDispatcher } from "svelte";
import { notifications } from "$lib/stores/notification.store";
import { AppError } from "$lib/services/api.error";

export function useSaveAction<T = any>(successMessage: string) {
    const isSaving = writable(false);
    const dispatch = createEventDispatcher<{ updated: T }>();

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
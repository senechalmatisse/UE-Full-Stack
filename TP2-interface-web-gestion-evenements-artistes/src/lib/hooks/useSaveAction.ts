import { writable } from "svelte/store";
import { createEventDispatcher } from "svelte";
import { getAppConfig, AppError } from '$lib/core';
import { notifications } from "$lib/stores/notification.store";

/**
 * Composable for handling save or update actions with state management,
 * event dispatching, and user notifications.
 *
 * Provides a reactive `isSaving` store and a `run` method that wraps
 * an async save operation with error handling and feedback.
 *
 * @template T - Type of the entity being saved or updated.
 *
 * @param successMessage - Message shown when the save action succeeds.
 * @returns Object containing:
 * - `isSaving`: Writable store tracking the saving state.
 * - `run`: Function to execute an async save action safely.
 */
export function useSaveAction<T = any>(successMessage: string) {
    const isSaving = writable(false);
    const dispatch = createEventDispatcher<{ updated: T }>();

    /**
     * Executes a save or update action with notifications and error handling.
     *
     * @param action - Async function that performs the save and returns the updated entity.
     * @returns The updated entity, or `null` if the operation fails.
     * @throws {AppError} If the save operation fails.
     */
    async function run(action: () => Promise<T | null>) {
        isSaving.set(true);
        const APP_CONFIG = getAppConfig();
        notifications.info(APP_CONFIG.messages.loading);

        try {
            const updated = await action();
            if (!updated) throw new AppError(500, "Mise à jour échouée");

            dispatch("updated", updated);
            notifications.success(successMessage);
            return updated;
        } catch (err) {
            const message =
                err instanceof AppError
                    ? err.message
                    : APP_CONFIG.errors.messages.generic;

            notifications.error(message);
            return null;
        } finally {
            isSaving.set(false);
        }
    }

    return { isSaving, run };
}
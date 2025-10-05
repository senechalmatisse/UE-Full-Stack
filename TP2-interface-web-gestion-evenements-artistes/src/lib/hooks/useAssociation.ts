import { writable, type Writable } from 'svelte/store';
import { getAppConfig, AppError  } from '$lib/core';
import { notifications } from '$lib/stores/notification.store';

type AssociationAction<T> = () => Promise<T | void>;
type UpdateFn<T> = (entity: T, action: 'add' | 'remove') => void;

type ActionResult<R> =
	| { success: true; data?: R }
	| { success: false; error?: string };

/**
 * Composable for managing associations between entities (e.g., Artist ↔ Event).
 *
 * Handles confirmation dialogs, notifications, and shared loading state
 * for add/remove operations.
 *
 * @template T - Type of entity being associated.
 */
export function useAssociation<T>() {
	const isLoading: Writable<boolean> = writable(false);

    /**
     * Executes an asynchronous action with unified error handling and notifications.
     *
     * @template R - Type of result returned by the action.
     * @param action - Async function to execute.
     * @param errorMsg - Fallback error message if the action fails.
     * @returns An {@link ActionResult} object with success or failure info.
     */
	async function performAction<R>(
		action: () => Promise<R>,
		errorMsg: string = getAppConfig().errors.messages.generic
	): Promise<ActionResult<R>> {
		isLoading.set(true);
		const APP_CONFIG = getAppConfig();
		notifications.info(APP_CONFIG.messages.loading);

		try {
			const data = await action();
			return { success: true, data };
		} catch (e: any) {
			if (e instanceof AppError) {
				notifications.error(e.message);
				return { success: false, error: e.message };
			} else {
                notifications.error(errorMsg);
                return { success: false, error: String(e) };
			}
		} finally {
			isLoading.set(false);
		}
	}

    /**
     * Adds an entity after confirmation, then updates local state and shows feedback.
     *
     * @param confirmMsg - Confirmation message shown to the user.
     * @param action - Async action returning the added entity.
     * @param updateFn - Callback to update the local state.
     * @param successMsg - Success message displayed on completion.
     * @param errorMsg - Optional fallback error message.
     */
	async function addEntity(
		confirmMsg: string,
		action: AssociationAction<T>,
		updateFn: UpdateFn<T>,
		successMsg: string,
		errorMsg: string = getAppConfig().errors.messages.notFound
	) {
		if (!confirm(confirmMsg)) {
			notifications.warning("Ajout annulé par l'utilisateur.");
			return;
		}

		const result = await performAction(action, errorMsg);
		if (result.success && result.data !== undefined) {
			updateFn(result.data as T, 'add');
			notifications.success(successMsg);
		}
	}

    /**
     * Removes an entity after confirmation, then updates local state and shows feedback.
     *
     * @param confirmMsg - Confirmation message shown to the user.
     * @param action - Async function to remove the entity.
     * @param updateFn - Callback to update local state.
     * @param entity - Entity to remove.
     * @param successMsg - Success message displayed on completion.
     * @param errorMsg - Optional fallback error message.
     */
	async function removeEntity(
		confirmMsg: string,
		action: () => Promise<void>,
		updateFn: UpdateFn<T>,
		entity: T,
		successMsg: string,
		errorMsg: string = getAppConfig().errors.messages.notFound
	) {
		if (!confirm(confirmMsg)) {
			notifications.warning("Suppression annulée");
			return;
		}

		const result = await performAction(action, errorMsg);
		if (result.success) {
			updateFn(entity, 'remove');
			notifications.success(successMsg);
		}
	}

	return { isLoading, addEntity, removeEntity, performAction };
}
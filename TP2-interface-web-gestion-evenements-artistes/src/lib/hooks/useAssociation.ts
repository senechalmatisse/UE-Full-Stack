import { writable, type Writable } from 'svelte/store';
import { notifications } from '$lib/stores/notification.store';
import { AppError } from '$lib/services/api.error';

type AssociationAction<T> = () => Promise<T | void>;
type UpdateFn<T> = (entity: T, action: 'add' | 'remove') => void;

type ActionResult<R> =
	| { success: true; data?: R }
	| { success: false; error?: string };

export function useAssociation<T>() {
	const isLoading: Writable<boolean> = writable(false);

	async function performAction<R>(
		action: () => Promise<R>,
		errorMsg: string
	): Promise<ActionResult<R>> {
		isLoading.set(true);

		notifications.info("Opération en cours...");

		try {
			const data = await action();
			return { success: true, data };
		} catch (e: any) {
			if (e instanceof AppError) {
				notifications.error(e.message);
				return { success: false, error: e.message };
			} else {
				notifications.error(errorMsg);
				const errMsg = e instanceof Error ? e.message : String(e);
				return { success: false, error: errMsg };
			}
		} finally {
			isLoading.set(false);
		}
	}

	/**
	 * Add an entity. `errorMsg` is optional, default is a generic french message.
	 *
	 * - action must return the created/loaded entity (T) on success.
	 */
	async function addEntity(
		confirmMsg: string,
		action: AssociationAction<T>,
		updateFn: UpdateFn<T>,
		successMsg: string,
		errorMsg = 'Impossible d\'ajouter la ressource'
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
	 * Remove an entity. action returns void (server call).
	 * `errorMsg` optional, default provided.
	 */
	async function removeEntity(
		confirmMsg: string,
		action: () => Promise<void>,
		updateFn: UpdateFn<T>,
		entity: T,
		successMsg: string,
		errorMsg = 'Impossible de supprimer la ressource'
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
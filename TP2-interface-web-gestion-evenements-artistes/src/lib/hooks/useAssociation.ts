import { writable, type Writable } from 'svelte/store';
import { getAppConfig } from '$lib/config';
import { notifications } from '$lib/stores/notification.store';
import { AppError } from '$lib/services/api.error';

type AssociationAction<T> = () => Promise<T | void>;
type UpdateFn<T> = (entity: T, action: 'add' | 'remove') => void;

type ActionResult<R> =
	| { success: true; data?: R }
	| { success: false; error?: string };

/**
 * Hook to manage associations between entities (e.g., artists ↔ events).
 *
 * Centralizes logic for:
 * - Handling async add/remove actions.
 * - Managing a shared loading state (`isLoading`).
 * - Triggering user notifications (info, success, warning, error).
 * - Confirming actions before executing them.
 *
 * @template T - The type of entity being associated (e.g., `Artist` or `Event`).
 *
 * @returns An object with utilities for managing associations:
 * - `isLoading`: Writable store representing the current loading state.
 * - `performAction`: Executes an async action with error handling and notifications.
 * - `addEntity`: Handles adding an entity with confirmation, update, and notifications.
 * - `removeEntity`: Handles removing an entity with confirmation, update, and notifications.
 *
 * @example
 * ```ts
 * const { isLoading, addEntity, removeEntity } = useAssociation<Artist>();
 *
 * async function linkArtist(artistId: string) {
 *   await addEntity(
 *     "Do you want to link this artist?",
 *     async () => {
 *       const artist = await api.getArtist(artistId);
 *       await api.addArtistToEvent(event.id, artist.id);
 *       return artist;
 *     },
 *     (artist, action) => {
 *       if (action === "add") event.artists.push(artist);
 *     },
 *     "Artist successfully linked!"
 *   );
 * }
 * ```
 */
export function useAssociation<T>() {
	const isLoading: Writable<boolean> = writable(false);

	/**
	 * Executes an async action with standardized error handling and notifications.
	 *
	 * - Displays a "loading" notification during execution.
	 * - Emits success or error notifications depending on the result.
	 * - Ensures loading state is properly reset at the end.
	 *
	 * @template R - The type of result returned by the action.
	 * @param action - An async function to execute.
	 * @param errorMsg - Fallback error message if the action fails.
	 * @returns An {@link ActionResult} with either the resolved data or an error.
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
				const errMsg = e instanceof Error ? e.message : String(e);
				return { success: false, error: errMsg };
			}
		} finally {
			isLoading.set(false);
		}
	}

	/**
	 * Handles the process of adding an entity with confirmation and notifications.
	 *
	 * - Displays a confirmation dialog before proceeding.
	 * - Executes the given `action`, which must return the added entity.
	 * - Calls the `updateFn` callback to update local state.
	 * - Shows success or error notifications.
	 *
	 * @param confirmMsg - Confirmation message shown to the user.
	 * @param action - Async function returning the added entity.
	 * @param updateFn - Callback to update the local state with the new entity.
	 * @param successMsg - Message shown when the operation succeeds.
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
	 * Handles the process of removing an entity with confirmation and notifications.
	 *
	 * - Displays a confirmation dialog before proceeding.
	 * - Executes the given `action`, which must perform the server deletion.
	 * - Calls the `updateFn` callback to update local state.
	 * - Shows success or error notifications.
	 *
	 * @param confirmMsg - Confirmation message shown to the user.
	 * @param action - Async function that removes the entity on the server.
	 * @param updateFn - Callback to update the local state after removal.
	 * @param entity - The entity being removed.
	 * @param successMsg - Message shown when the operation succeeds.
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
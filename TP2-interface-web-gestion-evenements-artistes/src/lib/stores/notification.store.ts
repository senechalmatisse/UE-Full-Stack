import { writable } from 'svelte/store';

/** Defines the possible types of notifications. */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/** Action optionnelle pour une notification (ex: bouton "Réessayer") */
export interface NotificationAction {
	label: string;
	callback: () => void;
}

/** Interface representing a single notification. */
export interface Notification {
	/** Unique identifier for the notification */
	id: number;
	/** Type of the notification (success, error, info, warning) */
	type: NotificationType;
	/** Message to display */
	message: string;
	/** Optional duration in milliseconds before auto-removal */
	timeout?: number;
	/** Actions supplémentaires (boutons optionnels) */
	actions?: NotificationAction[];
}

/**
 * Factory function to create a notification store.
 *
 * Provides reactive methods to add and remove notifications,
 * including auto-removal after a timeout.
 *
 * @returns An object containing the `subscribe` method and helper methods for each notification type
 */
function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);
	const timers = new Map<number, ReturnType<typeof setTimeout>>();

	/**
	 * Adds a new notification to the store.
	 *
	 * @param type - The type of notification
	 * @param message - The message to display
	 * @param timeout - Optional timeout in milliseconds before automatic removal (default 3000ms)
	 */
	function add(
		type: NotificationType,
		message: string,
		timeout?: number,
		actions?: NotificationAction[]
	) {
		if (timeout === undefined) {
			if (type === 'success' || type === 'info') timeout = 3000;
			else timeout = 5000;
		}

		const id = Date.now() + Math.floor(Math.random() * 1000);
		const notif: Notification = { id, type, message, timeout, actions };

		update((list) => [...list, notif]);

		if (timeout) {
			const timer = setTimeout(() => remove(id), timeout);
			timers.set(id, timer);
		}
	}

	/**
	 * Removes a notification by its ID.
	 *
	 * @param id - The unique identifier of the notification to remove
	 */
	function remove(id: number) {
		update((list) => list.filter((n) => n.id !== id));
		if (timers.has(id)) {
			clearTimeout(timers.get(id));
			timers.delete(id);
		}
	}

	return {
		subscribe,
		/** Add a success notification */
		success: (msg: string, t?: number, a?: NotificationAction[]) => add('success', msg, t, a),
		/** Add an error notification */
		error: (msg: string, t?: number, a?: NotificationAction[]) => add('error', msg, t, a),
		/** Add an info notification */
		info: (msg: string, t?: number, a?: NotificationAction[]) => add('info', msg, t, a),
		/** Add a warning notification */
		warning: (msg: string, t?: number, a?: NotificationAction[]) => add('warning', msg, t, a),
		/** Remove a notification by ID */
		remove
	};
}

/**
 * Reactive notification store instance.
 *
 * Can be imported and used across components to show notifications.
 */
export const notifications = createNotificationStore();
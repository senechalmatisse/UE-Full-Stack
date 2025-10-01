import { writable } from 'svelte/store';

/**
 * Defines the possible types of notifications.
 *
 * - `success`: Indicates a successful operation.
 * - `error`: Indicates a failure or critical issue.
 * - `info`: Provides general information.
 * - `warning`: Highlights potential issues or cautionary messages.
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Optional action associated with a notification.
 *
 * Represents a button or interactive element (e.g., "Retry").
 */
export interface NotificationAction {
	/** Label displayed on the action button. */
	label: string;

	/** Callback executed when the action is triggered. */
	callback: () => void;
}

/**
 * Interface representing a single notification.
 */
export interface Notification {
	/** Unique identifier for the notification. */
	id: number;

	/** Type of the notification (`success`, `error`, `info`, or `warning`). */
	type: NotificationType;

	/** Message to display to the user. */
	message: string;

	/** Optional duration in milliseconds before automatic removal. */
	timeout?: number;

	/** Optional additional actions (e.g., retry, dismiss). */
	actions?: NotificationAction[];
}

/**
 * Factory function to create a reactive notification store.
 *
 * This store provides:
 * - Reactive subscription to the notification list
 * - Utility methods to add notifications of different types
 * - Automatic removal of notifications after a timeout
 *
 * @returns An object containing:
 * - `subscribe`: Svelte store subscription method
 * - `success`: Add a success notification
 * - `error`: Add an error notification
 * - `info`: Add an info notification
 * - `warning`: Add a warning notification
 * - `remove`: Remove a notification by ID
 */
function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);
	const timers = new Map<number, ReturnType<typeof setTimeout>>();

	/**
	 * Adds a new notification to the store.
	 *
	 * @param type - The type of notification
	 * @param message - The message to display
	 * @param timeout - Optional timeout before auto-removal (defaults: 3000ms for success/info, 5000ms for error/warning)
	 * @param actions - Optional actions to attach to the notification
	 */
	function add(
		type: NotificationType,
		message: string,
		timeout?: number,
		actions?: NotificationAction[]
	) {
		if (timeout === undefined) {
			timeout = type === 'success' || type === 'info' ? 3000 : 5000;
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
		/** Add a success notification. */
		success: (msg: string, t?: number, a?: NotificationAction[]) => add('success', msg, t, a),

		/** Add an error notification. */
		error: (msg: string, t?: number, a?: NotificationAction[]) => add('error', msg, t, a),

		/** Add an info notification. */
		info: (msg: string, t?: number, a?: NotificationAction[]) => add('info', msg, t, a),

		/** Add a warning notification. */
		warning: (msg: string, t?: number, a?: NotificationAction[]) => add('warning', msg, t, a),

		/** Remove a notification by ID. */
		remove
	};
}

/**
 * Global reactive notification store instance.
 *
 * Can be imported and used across components to show notifications.
 *
 * @example
 * ```ts
 * import { notifications } from '$lib/stores/notification.store';
 *
 * notifications.info("Loading data...");
 * ```
 */
export const notifications = createNotificationStore();
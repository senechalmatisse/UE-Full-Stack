import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
	id: number;
	type: NotificationType;
	message: string;
	timeout?: number;
}

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);
	let counter = 0;

	function add(type: NotificationType, message: string, timeout = 3000) {
		const id = ++counter;
		const notif: Notification = { id, type, message, timeout };

		update((list) => [...list, notif]);

		if (timeout) {
			setTimeout(() => remove(id), timeout);
		}
	}

	function remove(id: number) {
		update((list) => list.filter((n) => n.id !== id));
	}

	return {
		subscribe,
		success: (msg: string, t?: number) => add('success', msg, t),
		error: (msg: string, t?: number) => add('error', msg, t),
		info: (msg: string, t?: number) => add('info', msg, t),
		warning: (msg: string, t?: number) => add('warning', msg, t),
		remove
	};
}

export const notifications = createNotificationStore();
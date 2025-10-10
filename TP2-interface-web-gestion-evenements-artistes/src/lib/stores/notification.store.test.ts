import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifications } from './notification.store';
import type { Notification } from './notification.store';

describe('notification store', () => {
	let unsub: () => void;
	let storeValue: Notification[] = [];

	beforeEach(() => {
		// GIVEN a fresh subscription before each test
		unsub = notifications.subscribe((v) => (storeValue = v));
	});

	afterEach(() => {
		// WHEN cleaning up between tests
        storeValue.forEach((n) => notifications.remove(n.id));
		unsub();
		storeValue = [];
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it('should add a success notification', () => {
		// GIVEN a message for success
		const message = 'Operation completed';

		// WHEN adding a success notification
		notifications.success(message);

		// THEN the store should contain one success notification with the correct message
		expect(storeValue.length).toBe(1);
		expect(storeValue[0].type).toBe('success');
		expect(storeValue[0].message).toBe(message);
		expect(storeValue[0].timeout).toBe(3000);
	});

	it('should add an error notification with default timeout', () => {
		// GIVEN an error message
		const message = 'Something went wrong';

		// WHEN adding an error notification
		notifications.error(message);

		// THEN it should have a default 5000ms timeout
		expect(storeValue.length).toBe(1);
		expect(storeValue[0].type).toBe('error');
		expect(storeValue[0].timeout).toBe(5000);
	});

	it('should remove a notification by id', () => {
		// GIVEN a notification in the store
		notifications.info('Test info');
		const id = storeValue[0].id;

		// WHEN removing it
		notifications.remove(id);

		// THEN the store should be empty
		expect(storeValue.length).toBe(0);
	});

	it('should automatically remove notification after timeout', async () => {
		vi.useFakeTimers();

		// GIVEN a success notification with 1000ms timeout
		notifications.success('Auto remove test', 1000);
		const id = storeValue[0].id;
		expect(storeValue.length).toBe(1);

		// WHEN the timer expires
		vi.advanceTimersByTime(1000);

		// THEN the notification should be automatically removed
		expect(storeValue.find((n) => n.id === id)).toBeUndefined();
	});

	it('should support custom timeout', () => {
		// GIVEN a warning notification with custom timeout
		const customTimeout = 8000;

		// WHEN adding it
		notifications.warning('Custom timeout test', customTimeout);

		// THEN the stored notification should use the custom timeout
		expect(storeValue[0].timeout).toBe(customTimeout);
	});

	it('should support actions on a notification', () => {
		// GIVEN an action
		const mockCallback = vi.fn();
		const actions = [{ label: 'Retry', callback: mockCallback }];

		// WHEN adding an error notification with an action
		notifications.error('Action test', undefined, actions);

		// THEN it should be stored with the provided actions
		expect(storeValue[0].actions).toBeDefined();
		expect(storeValue[0].actions?.[0].label).toBe('Retry');

		// WHEN invoking the action callback
		storeValue[0].actions?.[0].callback();

		// THEN the callback should be called
		expect(mockCallback).toHaveBeenCalledTimes(1);
	});
});
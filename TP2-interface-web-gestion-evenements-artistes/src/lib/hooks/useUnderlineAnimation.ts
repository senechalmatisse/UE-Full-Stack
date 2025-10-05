import { writable } from 'svelte/store';

interface UnderlineState {
	width: number;
	x: number;
}

/**
 * Composable for managing animated underline positioning and resizing.
 *
 * Encapsulates DOM measurements and update logic to reposition an underline
 * indicator (commonly used in navigation menus).
 *
 * @param defaultSelector - Default CSS selector for the active element.
 * @returns Object containing the underline state and helper methods.
 */
export function useUnderlineAnimation(defaultSelector = 'a.active') {
	const underlineState = writable<UnderlineState>({ width: 0, x: 0 });

    /**
     * Updates the underline position based on a target element or selector.
     *
     * @param target - The target HTML element or selector to align the underline with.
     */
	function updatePosition(target?: HTMLElement | string): void {
		let element: HTMLElement | null = null;

		if (typeof target === 'string') {
			element = document.querySelector<HTMLElement>(target);
		} else if (target instanceof HTMLElement) {
			element = target;
		} else {
			element = document.querySelector<HTMLElement>(defaultSelector);
		}

		if (!element || !element.offsetParent) return;

		const width = element.offsetWidth;
		const x = element.offsetLeft;

		underlineState.set({ width, x });
	}

    /**
     * Sets up a debounced listener to handle window resize events.
     *
     * @param callback - Function called when the window is resized.
     * @param delay - Debounce delay in milliseconds (default: 100ms).
     * @returns Function to remove the listener.
     */
	function setupResizeListener(callback: () => void, delay = 100): () => void {
		let timer: number | undefined;
		const handler = () => {
			clearTimeout(timer);
			timer = window.setTimeout(callback, delay);
		};

		window.addEventListener('resize', handler);
		return () => window.removeEventListener('resize', handler);
	}

    return { underlineState, updatePosition, setupResizeListener };
}
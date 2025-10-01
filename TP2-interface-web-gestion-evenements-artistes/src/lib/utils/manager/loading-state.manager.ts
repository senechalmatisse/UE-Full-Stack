import {
    ConfigErrorResolver,
    type ErrorResolver
} from "$lib/utils/resolvers/error.resolver";

// Type représentant l’état
export interface LoadingState {
	isLoading: boolean;
	error: string | null;
}

/**
 * Manager for tracking and broadcasting loading state.
 *
 * Provides a publish/subscribe mechanism for components
 * to react to loading or error state changes.
 *
 * @example
 * ```ts
 * const manager = new LoadingStateManager();
 *
 * const unsubscribe = manager.subscribe((state) => {
 *   console.log("Loading:", state.isLoading, "Error:", state.error);
 * });
 *
 * manager.startLoading();
 * manager.setError("Something went wrong");
 * manager.stopLoading();
 * unsubscribe();
 * ```
 */
export class LoadingStateManager {
	private state: LoadingState = { isLoading: false, error: null };
	private callbacks: Array<(state: LoadingState) => void> = [];

	constructor(private errorResolver: ErrorResolver = new ConfigErrorResolver()) {}

	/** Starts the loading state and clears any previous error. */
	startLoading(): void {
		this.state = { isLoading: true, error: null };
		this.notifySubscribers();
	}

	/** Stops the loading state successfully (clears error). */
	stopLoading(): void {
		this.state = { isLoading: false, error: null };
		this.notifySubscribers();
	}

	/**
	 * Stops the loading state and records an error message.
	 *
	 * @param error - The error message.
	 */
	setError(errorCode: number): void {
		this.state = {
			isLoading: false,
			error: this.errorResolver.resolve(errorCode)
		};
		this.notifySubscribers();
	}

	/** Resets both loading and error states. */
	reset(): void {
		this.state = { isLoading: false, error: null };
		this.notifySubscribers();
	}

	/**
	 * Returns the current state snapshot.
	 *
	 * @returns An object containing `isLoading` and `error`.
	 */
	getState(): LoadingState {
		return { ...this.state };
	}

	/**
	 * Subscribes to state changes.
	 *
	 * @param callback - Function to call whenever state changes.
	 * @returns A cleanup function to unsubscribe.
	 */
	subscribe(callback: (state: LoadingState) => void): () => void {
		this.callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = this.callbacks.indexOf(callback);
			if (index > -1) {
				this.callbacks.splice(index, 1);
			}
		};
	}

	/** Notifies all subscribers with the current state. */
	private notifySubscribers(): void {
		const snapshot = this.getState();
		this.callbacks.forEach(cb => cb(snapshot));
	}
}
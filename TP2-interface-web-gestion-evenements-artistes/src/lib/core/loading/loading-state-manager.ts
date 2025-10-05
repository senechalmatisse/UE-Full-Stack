import type { IErrorResolver } from "./error-resolver.interface";
import type { ILoadingState } from "./loading-state.interface";
import { ConfigErrorResolver } from "./error-resolver.config";

/**
 * @fileoverview
 * Provides a reactive manager for handling loading and error states.
 *
 * The {@link LoadingStateManager} uses a publish/subscribe pattern,
 * enabling components to reactively respond to asynchronous loading
 * and error changes.
 */
export class LoadingStateManager {
    /** Internal state tracking loading and error information. */
    private state: ILoadingState = { isLoading: false, error: null };

    /** Internal state tracking loading and error information. */
    private callbacks: Array<(state: ILoadingState) => void> = [];

    /**
     * @param errorResolver - Optional custom resolver for translating error codes.
     * Defaults to {@link ConfigErrorResolver}.
     */
    constructor(private errorResolver: IErrorResolver = new ConfigErrorResolver()) {}

    /**
     * Marks the state as "loading" and clears any existing error.
     */
    startLoading(): void {
        this.state = { isLoading: true, error: null };
        this.notifySubscribers();
    }

    /**
     * Marks the state as "not loading" and clears any existing error.
     */
    stopLoading(): void {
        this.state = { isLoading: false, error: null };
        this.notifySubscribers();
    }

    /**
     * Stops the loading state and records an error message based on a code.
     *
     * @param errorCode - Numeric HTTP or application-specific error code.
     */
    setError(errorCode: number): void {
        this.state = {
            isLoading: false,
            error: this.errorResolver.resolve(errorCode)
        };
        this.notifySubscribers();
    }

    /**
     * Resets both loading and error states to their defaults.
     */
    reset(): void {
        this.state = { isLoading: false, error: null };
        this.notifySubscribers();
    }

    /**
     * Returns a snapshot of the current state.
     *
     * @returns A shallow copy of the current state.
     */
    getState(): ILoadingState {
        return { ...this.state };
    }

    /**
     * Subscribes a callback to state updates.
     *
     * @param callback - Function invoked whenever the state changes.
     * @returns A cleanup function to unsubscribe the listener.
     */
    subscribe(callback: (state: ILoadingState) => void): () => void {
        this.callbacks.push(callback);

        return () => {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notifies all registered subscribers with the current state snapshot.
     */
    private notifySubscribers(): void {
        const snapshot = this.getState();
        this.callbacks.forEach(cb => cb(snapshot));
    }
}
/**
 * @fileoverview
 * Defines the structure representing a loading and error state.
 *
 * Used by {@link LoadingStateManager} to provide consistent
 * state management for asynchronous operations.
 */

/**
 * Represents the current loading and error state of a component or service.
 */
export interface ILoadingState {
    /**
     * Indicates whether the component is currently performing
     * an asynchronous operation.
     */
    isLoading: boolean;

    /**
     * Holds the last error message if an error occurred, or `null`
     * when no error is present.
     */
    error: string | null;
}
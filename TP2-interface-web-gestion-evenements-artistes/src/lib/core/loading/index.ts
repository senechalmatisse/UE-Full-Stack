/**
 * @fileoverview
 * Central export module for loading and error state management utilities.
 *
 * Exports interfaces, resolvers, and state management classes
 * for consistent error handling and UI feedback.
 */

export type { ILoadingState } from "./loading-state.interface";
export type { IErrorResolver } from "./error-resolver.interface";

export { LoadingStateManager } from "./loading-state-manager";
export { ConfigErrorResolver } from "./error-resolver.config";
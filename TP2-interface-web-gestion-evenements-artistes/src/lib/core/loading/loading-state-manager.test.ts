import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoadingStateManager } from "./loading-state-manager";
import { ConfigErrorResolver } from "./error-resolver.config";
import type { IErrorResolver } from "./error-resolver.interface";

describe("LoadingStateManager", () => {
	let manager: LoadingStateManager;
	let mockResolver: IErrorResolver;

	beforeEach(() => {
		// GIVEN a mocked error resolver
		mockResolver = {
			resolve: vi.fn((code: number) => `Error ${code}`)
		};
		manager = new LoadingStateManager(mockResolver);
	});

	// --- START LOADING TEST ---------------------------------------------------

	it("should set isLoading to true and clear error when startLoading is called", () => {
		// GIVEN an initial state
		const subscriber = vi.fn();
		manager.subscribe(subscriber);

		// WHEN startLoading is called
		manager.startLoading();

		// THEN state should be loading and error cleared
		const state = manager.getState();
		expect(state.isLoading).toBe(true);
		expect(state.error).toBeNull();
		expect(subscriber).toHaveBeenCalledWith(state);
	});

	// --- STOP LOADING TEST ----------------------------------------------------

	it("should set isLoading to false and clear error when stopLoading is called", () => {
		// GIVEN a loading state
		manager.startLoading();
		const subscriber = vi.fn();
		manager.subscribe(subscriber);

		// WHEN stopLoading is called
		manager.stopLoading();

		// THEN loading should stop and error cleared
		const state = manager.getState();
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
		expect(subscriber).toHaveBeenCalledWith(state);
	});

	// --- SET ERROR TEST -------------------------------------------------------

	it("should set error message from resolver and stop loading", () => {
		// GIVEN a loading state and mocked resolver
		manager.startLoading();
		const subscriber = vi.fn();
		manager.subscribe(subscriber);

		// WHEN setError is called with a specific error code
		manager.setError(404);

		// THEN it should stop loading and set resolved error message
		const state = manager.getState();
		expect(mockResolver.resolve).toHaveBeenCalledWith(404);
		expect(state.isLoading).toBe(false);
		expect(state.error).toBe("Error 404");
		expect(subscriber).toHaveBeenCalledWith(state);
	});

	// --- RESET TEST -----------------------------------------------------------

	it("should reset loading and error states to default", () => {
		// GIVEN a state with an error
		manager.setError(500);
		const subscriber = vi.fn();
		manager.subscribe(subscriber);

		// WHEN reset is called
		manager.reset();

		// THEN state should return to default
		const state = manager.getState();
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
		expect(subscriber).toHaveBeenCalledWith(state);
	});

	// --- SUBSCRIBE AND UNSUBSCRIBE TEST --------------------------------------

	it("should call subscriber on state change and allow unsubscribe", () => {
		// GIVEN a subscriber and subscription
		const subscriber = vi.fn();
		const unsubscribe = manager.subscribe(subscriber);

		// WHEN state changes and subscriber unsubscribes
		manager.startLoading();
		unsubscribe();
		manager.stopLoading();

		// THEN subscriber should be called only once
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	// --- DEFAULT RESOLVER TEST ------------------------------------------------

	it("should use ConfigErrorResolver by default", () => {
		// GIVEN a new manager with default constructor
		const defaultManager = new LoadingStateManager();
		const defaultResolverSpy = vi.spyOn(ConfigErrorResolver.prototype, "resolve");

		// WHEN setError is called
		defaultManager.setError(403);

		// THEN ConfigErrorResolver should be used
		expect(defaultResolverSpy).toHaveBeenCalledWith(403);

		defaultResolverSpy.mockRestore();
	});
});
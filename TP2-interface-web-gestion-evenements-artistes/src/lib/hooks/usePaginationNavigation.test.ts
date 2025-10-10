import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePaginationNavigation } from "./usePaginationNavigation";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { notifications } from "$lib/stores/notification.store";
import { getAppConfig } from "$lib/core";

// --- Mocks ---
vi.mock("$app/navigation", () => ({
	goto: vi.fn(),
}));
vi.mock("svelte/store", async () => {
    const actual = await vi.importActual<typeof import("svelte/store")>("svelte/store");
    return {
        ...actual,
        get: vi.fn(),
    };
});
vi.mock("$lib/stores/notification.store", () => ({
	notifications: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));
vi.mock("$lib/core", () => ({
	getAppConfig: vi.fn(() => ({
		pagination: { defaultSize: 10 },
		errors: {
			map: {},
			messages: { generic: "An unexpected error occurred." },
		},
	})),
	ConfigErrorResolver: class MockResolver {
		resolve(code: number) {
			return `Error ${code}`;
		}
	},
	LoadingStateManager: class MockManager {
        state: { isLoading: boolean; error: string | null } = { isLoading: false, error: null };
		startLoading = vi.fn(() => (this.state.isLoading = true));
		stopLoading = vi.fn(() => (this.state.isLoading = false));
        setError = vi.fn((code: number) => {
            this.state.error = `Error ${code}`;
        });
		reset = vi.fn(() => (this.state = { isLoading: false, error: null }));
		getState = vi.fn(() => this.state);
		subscribe = vi.fn(() => vi.fn());
	},
}));

describe("usePaginationNavigation", () => {
	let mockGoto: ReturnType<typeof vi.fn>;
	let mockGet: ReturnType<typeof vi.fn>;
	let mockNotifications: typeof notifications;
	let mockConfig: ReturnType<typeof getAppConfig>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGoto = goto as unknown as ReturnType<typeof vi.fn>;
		mockGet = get as unknown as ReturnType<typeof vi.fn>;
		mockNotifications = notifications;
		mockConfig = getAppConfig();
	});

	it("shouldBuildDefaultConfigurationCorrectly", () => {
		// GIVEN a basic configuration with an entity name
		const options = { entity: "artists" };

		// WHEN calling usePaginationNavigation
		const navigation = usePaginationNavigation(options);

		// THEN the default config should be applied
		expect(navigation.loadingManager).toBeDefined();
		expect(navigation.state).toEqual({ isLoading: false, error: null });
		expect(typeof navigation.navigateToPage).toBe("function");
	});

	it("shouldNavigateToPageWithCorrectUrl", async () => {
		// GIVEN a current page URL and entity
		const currentUrl = new URL("https://example.com/current?page=2&size=5");
		mockGet.mockReturnValue({ url: currentUrl });

		const navigation = usePaginationNavigation({ entity: "events" });

		// WHEN navigating to page 3
		await navigation.navigateToPage(3);

		// THEN goto should be called with correct parameters
		expect(mockGoto).toHaveBeenCalledWith("/events?page=3&size=5");
		expect(navigation.loadingManager.startLoading).toHaveBeenCalled();
		expect(navigation.loadingManager.stopLoading).toHaveBeenCalled();
	});

	it("shouldIncludeSearchQueryWhenEnabled", async () => {
		// GIVEN a configuration with search enabled
		const currentUrl = new URL("https://example.com/current?page=1&size=10");
		mockGet.mockReturnValue({ url: currentUrl });
		const navigation = usePaginationNavigation({ entity: "artists", withSearch: true });

		// WHEN navigating to page 1 with a search query
		await navigation.navigateToPage(1, "rock music");

		// THEN the encoded query should be present
		expect(mockGoto).toHaveBeenCalledWith("/artists?page=1&size=10&search=rock%20music");
	});

	it("shouldHandleNavigationErrorGracefully", async () => {
		// GIVEN a failing goto function
		mockGoto.mockRejectedValueOnce(new Error("Network Error"));
		mockGet.mockReturnValue({ url: new URL("https://example.com/current?page=1&size=10") });

		const navigation = usePaginationNavigation({ entity: "albums" });

		// WHEN navigating to a page
		await navigation.navigateToPage(2);

		// THEN an error notification should be displayed and error set
		expect(mockNotifications.error).toHaveBeenCalledWith(
			"Une erreur est survenue lors de la navigation vers albums."
		);
		expect(navigation.loadingManager.setError).toHaveBeenCalledWith(500);
		expect(navigation.loadingManager.stopLoading).toHaveBeenCalled();
	});

    it("shouldUseDefaultSizeIfNotPresentInUrl", async () => {
        // GIVEN a current page URL without a 'size' parameter
        const currentUrl = new URL("https://example.com/current?page=1");
        mockGet.mockReturnValue({ url: currentUrl });
        const navigation = usePaginationNavigation({ entity: "artists", defaultSize: 20 });

        // WHEN navigating to page 2 without providing size in URL
        await navigation.navigateToPage(2);

        // THEN goto should be called with the default size
        expect(mockGoto).toHaveBeenCalledWith("/artists?page=2&size=20");
        expect(navigation.loadingManager.startLoading).toHaveBeenCalled();
        expect(navigation.loadingManager.stopLoading).toHaveBeenCalled();
    });

	it("shouldResetLoadingStateProperly", () => {
		// GIVEN a navigation instance
		const navigation = usePaginationNavigation({ entity: "events" });

		// WHEN resetting loading state
		navigation.resetLoadingState();

		// THEN reset should have been called on the manager
		expect(navigation.loadingManager.reset).toHaveBeenCalled();
	});

	it("shouldSubscribeAndUnsubscribeFromLoadingState", () => {
		// GIVEN a navigation instance
		const navigation = usePaginationNavigation({ entity: "events" });

		// WHEN subscribing to loading state
		const unsubscribe = navigation.subscribeToLoading(vi.fn());

		// THEN unsubscribe should be callable
		expect(typeof unsubscribe).toBe("function");
	});
});
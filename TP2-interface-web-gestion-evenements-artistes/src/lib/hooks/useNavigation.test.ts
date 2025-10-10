import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

vi.mock("svelte/store", () => ({
	get: vi.fn(),
}));
vi.mock("$app/stores", () => ({
	page: { subscribe: vi.fn(), url: new URL("https://example.com/current") },
}));
vi.mock("$lib/core", () => ({
    NavigationUrlBuilder: vi.fn().mockImplementation(() => ({
        build: vi.fn((targetPath: string, currentUrl: URL) => `${targetPath}-built`),
    })),
}));

describe("useNavigation", () => {
	let buildSpy: ReturnType<typeof vi.fn>;
	let NavigationUrlBuilder: any;
	let useNavigationRef: any;

	beforeEach(async () => {
		vi.resetModules();
		buildSpy = vi.fn((targetPath: string, currentUrl: URL) => `${targetPath}-built`);

		vi.doMock("$lib/core", () => ({
			NavigationUrlBuilder: vi.fn().mockImplementation(() => ({
				build: buildSpy,
			})),
		}));

		const module = await import("./useNavigation");
		useNavigationRef = module.useNavigation;

		const core = await import("$lib/core");
		NavigationUrlBuilder = core.NavigationUrlBuilder;

		// Mock du store
		(get as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			url: new URL("https://example.com/current"),
		});
	});

	it("shouldInitializeUrlBuilderLazily", () => {
		// GIVEN no instance yet
		expect(NavigationUrlBuilder).not.toHaveBeenCalled();

		// WHEN
		useNavigationRef();

		// THEN
		expect(NavigationUrlBuilder).toHaveBeenCalledTimes(1);
	});

	it("shouldReuseExistingUrlBuilderOnSubsequentCalls", () => {
		// GIVEN
		useNavigationRef();

		// WHEN
		useNavigationRef();

		// THEN
		expect(NavigationUrlBuilder).toHaveBeenCalledTimes(1);
	});

	it("shouldCallBuildMethodWithCurrentUrlAndReturnHref", () => {
		// GIVEN
		const currentUrl = new URL("https://example.com/events?page=1");
		(get as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ url: currentUrl });

		const { buildHref } = useNavigationRef();

		// WHEN
		const result = buildHref("/artists");

		// THEN
		expect(buildSpy).toHaveBeenCalledWith("/artists", currentUrl);
		expect(result).toBe("/artists-built");
	});

	it("shouldReturnRootHrefDirectlyIfBuilderReturnsSlash", async () => {
		vi.resetModules();

		// Import real builder this time (no mock)
		vi.doMock("$lib/core", async () => {
			const actual = await vi.importActual("$lib/core");
			return actual;
		});

		const { useNavigation } = await import("./useNavigation");

		(get as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			url: new URL("https://example.com/anything"),
		});

		// WHEN
		const { buildHref } = useNavigation();
		const result = buildHref("/");

		// THEN
		expect(result).toBe("/");
	});
});
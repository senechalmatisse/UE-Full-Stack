import { describe, it, expect, beforeEach, vi } from "vitest";
import { NavigationUrlBuilder } from "./navigation-url.builder";
import { setAppConfig, getAppConfig } from "../config";
import { PageResetStrategy } from "./page-reset.strategy";
import { ParameterFilterStrategy } from "./parameter-filter.strategy";

/**
 * @displayName NavigationUrlBuilder Tests
 * @public
 *
 * Unit tests for {@link NavigationUrlBuilder} following the GIVEN-WHEN-THEN pattern.
 */
describe("NavigationUrlBuilder", () => {
    let builder: NavigationUrlBuilder;

    beforeEach(() => {
        // GIVEN a default navigation configuration
        setAppConfig({
            ...getAppConfig(),
            navigation: {
                resetPageOnNavigate: true,
                ignoredParams: {
                    "/artists": ["search"],
                    "/events": ["search"],
                    "/": ["page", "size", "search"],
                },
            },
        });

        builder = new NavigationUrlBuilder();
    });

    // ---------------------------------------------------------------------
    // ✅ TEST 1 — Root path returns "/"
    // ---------------------------------------------------------------------
    it("shouldReturnRootPathWhenTargetIsSlash", () => {
        // GIVEN a current URL with parameters
        const currentUrl = new URL("https://example.com/?page=2&search=abc");

        // WHEN building navigation to "/"
        const result = builder.build("/", currentUrl);

        // THEN the output should be exactly "/"
        expect(result).toBe("/");
    });

    // ---------------------------------------------------------------------
    // ✅ TEST 2 — Default strategies are applied
    // ---------------------------------------------------------------------
    it("shouldApplyDefaultStrategiesWhenNoneProvided", () => {
        // GIVEN a URL with some parameters
        const currentUrl = new URL("https://example.com/events?page=2&search=rock");
        const targetPath = "/artists";

        // WHEN building a navigation URL
        const result = builder.build(targetPath, currentUrl);

        // THEN it should apply both default strategies
        expect(result).toContain("/artists");
        expect(builder["strategies"]).toHaveLength(2);
        expect(builder["strategies"][0]).toBeInstanceOf(PageResetStrategy);
        expect(builder["strategies"][1]).toBeInstanceOf(ParameterFilterStrategy);
    });

    // ---------------------------------------------------------------------
    // ✅ TEST 3 — Query parameters are filtered according to ignoredParams
    // ---------------------------------------------------------------------
    it("shouldFilterIgnoredParametersBasedOnRouteConfig", () => {
        // GIVEN a current URL with ignored and allowed params
        const currentUrl = new URL("https://example.com/artists?page=2&search=pop&genre=rock");
        const targetPath = "/artists";

        // WHEN building the URL
        const result = builder.build(targetPath, currentUrl);

        // THEN ignored params ("search") should be removed, others kept
        expect(result).toContain("/artists");
        expect(result).toContain("genre=rock");
        expect(result).not.toContain("search=");
    });

    // ---------------------------------------------------------------------
    // ✅ TEST 4 — Custom strategy list is used
    // ---------------------------------------------------------------------
    it("shouldUseCustomStrategiesWhenProvided", () => {
        // GIVEN a fake custom strategy
        const mockStrategy = {
            applyTo: vi.fn().mockImplementation((params) => params),
        };

        const customBuilder = new NavigationUrlBuilder([mockStrategy]);

        const currentUrl = new URL("https://example.com/?a=1");
        const targetPath = "/custom";

        // WHEN building the URL
        customBuilder.build(targetPath, currentUrl);

        // THEN the custom strategy should have been called
        expect(mockStrategy.applyTo).toHaveBeenCalledTimes(1);
    });

    // ---------------------------------------------------------------------
    // ✅ TEST 5 — Query parameters are correctly serialized
    // ---------------------------------------------------------------------
    it("shouldSerializeQueryParametersProperly", () => {
        // GIVEN a URL with multiple query parameters
        const currentUrl = new URL("https://example.com/events?page=3&sort=asc");
        const targetPath = "/artists";

        // WHEN building the URL
        const result = builder.build(targetPath, currentUrl);

        // THEN the result should contain query parameters joined by '&'
        expect(result).toMatch(/^\/artists\?.*=/);
    });

    it("shouldReturnTargetPathWhenNoQueryParametersRemain", () => {
        // GIVEN a current URL without query parameters and no strategies applied
        const currentUrl = new URL("https://example.com/events");
        const builder = new NavigationUrlBuilder([]); // no strategies => no page param added
    
        // WHEN building the navigation URL
        const result = builder.build("/artists", currentUrl);
    
        // THEN the result should be exactly the targetPath (no ?query)
        expect(result).toBe("/artists");
    });
});
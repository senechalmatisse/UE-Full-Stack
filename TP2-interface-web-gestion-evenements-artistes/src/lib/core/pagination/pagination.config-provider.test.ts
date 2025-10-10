import { describe, it, expect, vi } from "vitest";
import { AppConfigPaginationProvider } from "./pagination.config-provider";
import { getAppConfig } from "../config";

// Mock the global config module
vi.mock("../config", () => ({
    getAppConfig: vi.fn()
}));

describe("AppConfigPaginationProvider", () => {
    it("shouldReturnConfiguredMaxVisiblePages", () => {
        // GIVEN a mocked global configuration returning a pagination limit
        (getAppConfig as vi.Mock).mockReturnValue({
            pagination: { maxVisiblePages: 7 }
        });

        const provider = new AppConfigPaginationProvider();

        // WHEN retrieving the maximum number of visible pages
        const result = provider.getMaxVisiblePages();

        // THEN it should return the configured value
        expect(result).toBe(7);
    });

    it("shouldReflectUpdatedConfigurationValues", () => {
        // GIVEN an initial configuration
        (getAppConfig as vi.Mock).mockReturnValueOnce({
            pagination: { maxVisiblePages: 5 }
        });

        const provider = new AppConfigPaginationProvider();

        // WHEN calling getMaxVisiblePages the first time
        const firstResult = provider.getMaxVisiblePages();

        // THEN it should return the first configured value
        expect(firstResult).toBe(5);

        // GIVEN an updated configuration with a new value
        (getAppConfig as vi.Mock).mockReturnValueOnce({
            pagination: { maxVisiblePages: 10 }
        });

        // WHEN calling getMaxVisiblePages again
        const secondResult = provider.getMaxVisiblePages();

        // THEN it should reflect the updated configuration value
        expect(secondResult).toBe(10);
    });

    it("shouldThrowErrorWhenPaginationConfigIsMissing", () => {
        // GIVEN a malformed configuration missing the pagination field
        (getAppConfig as vi.Mock).mockReturnValue({});

        const provider = new AppConfigPaginationProvider();

        // WHEN & THEN calling getMaxVisiblePages should throw
        expect(() => provider.getMaxVisiblePages()).toThrow();
    });
});
import { describe, it, expect, vi } from "vitest";
import type { IPaginationConfigProvider } from "./pagination.config-provider.interface";
import type { IPaginationStrategy } from "./pagination.strategy.interface";
import { PaginationUtils } from "./pagination.utils";

describe("PaginationUtils", () => {
    it("shouldComputeVisiblePagesUsingDefaultStrategy", () => {
        // GIVEN a mock config provider returning maxVisiblePages = 5
        const mockConfigProvider: IPaginationConfigProvider = {
            getMaxVisiblePages: vi.fn().mockReturnValue(5)
        };

        // AND a PaginationUtils instance using default strategy
        const utils = new PaginationUtils(mockConfigProvider);

        // WHEN getting visible pages for currentPage=3, totalPages=10
        const visiblePages = utils.getVisiblePages(3, 10);

        // THEN it should return an array of 5 page numbers centered around currentPage
        expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
    });

    it("shouldUseCustomStrategyWhenProvided", () => {
        // GIVEN a mock config provider returning maxVisiblePages = 3
        const mockConfigProvider: IPaginationConfigProvider = {
            getMaxVisiblePages: vi.fn().mockReturnValue(3)
        };

        // AND a custom strategy that always returns [1, 2, 3]
        const customStrategy: IPaginationStrategy = {
            getVisiblePages: vi.fn().mockReturnValue([1, 2, 3])
        };

        // AND a PaginationUtils instance using the custom strategy
        const utils = new PaginationUtils(mockConfigProvider, customStrategy);

        // WHEN getting visible pages for any page
        const visiblePages = utils.getVisiblePages(7, 20);

        // THEN it should return the array from the custom strategy
        expect(visiblePages).toEqual([1, 2, 3]);
        expect(customStrategy.getVisiblePages).toHaveBeenCalledWith(7, 20, 3);
    });

    it("shouldReturnCorrectPaginationInfo", () => {
        // GIVEN a PaginationUtils instance with any config
        const mockConfigProvider: IPaginationConfigProvider = {
            getMaxVisiblePages: vi.fn().mockReturnValue(5)
        };
        const utils = new PaginationUtils(mockConfigProvider);

        // WHEN getting pagination info for page=2 and totalPages=8
        const info = utils.getPaginationInfo(2, 8);

        // THEN it should return a human-readable string
        expect(info).toBe("Page 2 sur 8");
    });
});
import { describe, it, expect } from "vitest";
import { DefaultPaginationStrategy } from "./pagination.strategy";

describe("DefaultPaginationStrategy", () => {
    it("shouldReturnAllPagesWhenTotalPagesLessThanMaxVisible", () => {
        // GIVEN a total number of pages less than or equal to maxVisible
        const strategy = new DefaultPaginationStrategy();
        const currentPage = 2;
        const totalPages = 3;
        const maxVisible = 5;

        // WHEN calculating visible pages
        const result = strategy.getVisiblePages(currentPage, totalPages, maxVisible);

        // THEN it should return all page numbers
        expect(result).toEqual([1, 2, 3]);
    });

    it("shouldCenterPagesAroundCurrentPageWhenTotalPagesExceedMaxVisible", () => {
        // GIVEN more total pages than maxVisible
        const strategy = new DefaultPaginationStrategy();
        const currentPage = 5;
        const totalPages = 10;
        const maxVisible = 5;

        // WHEN calculating visible pages
        const result = strategy.getVisiblePages(currentPage, totalPages, maxVisible);

        // THEN the pages should be centered around the current page
        expect(result).toEqual([3, 4, 5, 6, 7]);
    });

    it("shouldAdjustStartWhenCurrentPageNearStart", () => {
        // GIVEN currentPage near the start
        const strategy = new DefaultPaginationStrategy();
        const currentPage = 1;
        const totalPages = 10;
        const maxVisible = 5;

        // WHEN calculating visible pages
        const result = strategy.getVisiblePages(currentPage, totalPages, maxVisible);

        // THEN the pages should start from 1 and show maxVisible pages
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("shouldAdjustEndWhenCurrentPageNearEnd", () => {
        // GIVEN currentPage near the end
        const strategy = new DefaultPaginationStrategy();
        const currentPage = 10;
        const totalPages = 10;
        const maxVisible = 5;

        // WHEN calculating visible pages
        const result = strategy.getVisiblePages(currentPage, totalPages, maxVisible);

        // THEN the pages should end at totalPages and show maxVisible pages
        expect(result).toEqual([6, 7, 8, 9, 10]);
    });

    it("shouldReturnSinglePageWhenOnlyOnePageExists", () => {
        // GIVEN a single page scenario
        const strategy = new DefaultPaginationStrategy();
        const currentPage = 1;
        const totalPages = 1;
        const maxVisible = 5;

        // WHEN calculating visible pages
        const result = strategy.getVisiblePages(currentPage, totalPages, maxVisible);

        // THEN it should return only the first page
        expect(result).toEqual([1]);
    });
});
import { describe, it, expect } from "vitest";
import { PaginationValidator } from "./pagination.validator";

describe("PaginationValidator", () => {
    // GIVEN a PaginationValidator with minSize=1, maxSize=50, defaultSize=10
    const validator = new PaginationValidator(1, 50, 10);

    describe("validate", () => {
        it("shouldReturnDefaultsWhenNoParamsProvided", () => {
            // GIVEN no pageParam and no sizeParam
            const pageParam = null;
            const sizeParam = null;

            // WHEN validating
            const result = validator.validate(pageParam, sizeParam);

            // THEN page should be 1 and size should be default 10
            expect(result.page).toBe(1);
            expect(result.size).toBe(10);
        });

        it("shouldClampPageToMinOne", () => {
            // GIVEN an invalid pageParam (0 or negative)
            const pageParam = "0";
            const sizeParam = "10";

            // WHEN validating
            const result = validator.validate(pageParam, sizeParam);

            // THEN page should be at least 1
            expect(result.page).toBe(1);
            expect(result.size).toBe(10);
        });

        it("shouldClampSizeBetweenMinAndMax", () => {
            // GIVEN a sizeParam exceeding maxSize and below minSize
            const tooLargeSize = "100";
            const tooSmallSize = "0";

            // WHEN validating large size
            const resultLarge = validator.validate("1", tooLargeSize);

            // THEN size should be clamped to maxSize
            expect(resultLarge.size).toBe(50);

            // WHEN validating small size
            const resultSmall = validator.validate("1", tooSmallSize);

            // THEN size should be clamped to minSize
            expect(resultSmall.size).toBe(10);
        });

        it("shouldParseValidNumbersCorrectly", () => {
            // GIVEN valid string numbers
            const pageParam = "5";
            const sizeParam = "20";

            // WHEN validating
            const result = validator.validate(pageParam, sizeParam);

            // THEN page and size should match the parsed numbers
            expect(result.page).toBe(5);
            expect(result.size).toBe(20);
        });
    });

    describe("toApiPage", () => {
        it("shouldConvertClientPageToZeroIndexedApiPage", () => {
            // GIVEN a client page number
            const page = 3;

            // WHEN converting to API page
            const apiPage = validator.toApiPage(page);

            // THEN API page should be zero-indexed
            expect(apiPage).toBe(2);
        });

        it("shouldNotReturnNegativeApiPage", () => {
            // GIVEN a page number less than 1
            const page = 0;

            // WHEN converting
            const apiPage = validator.toApiPage(page);

            // THEN API page should be at least 0
            expect(apiPage).toBe(0);
        });
    });

    describe("fromApiPage", () => {
        it("shouldConvertZeroIndexedApiPageToClientPage", () => {
            // GIVEN an API page number
            const apiPage = 4;

            // WHEN converting to client page
            const page = validator.fromApiPage(apiPage);

            // THEN client page should be one-indexed
            expect(page).toBe(5);
        });

        it("shouldNotReturnPageLessThanOne", () => {
            // GIVEN a negative API page
            const apiPage = -1;

            // WHEN converting
            const page = validator.fromApiPage(apiPage);

            // THEN client page should be at least 1
            expect(page).toBe(1);
        });
    });
});
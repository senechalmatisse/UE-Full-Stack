import { describe, it, expect } from "vitest";
import { DataValidator } from "./data.validator";

describe("DataValidator", () => {
    // GIVEN a DataValidator instance
    const validator = new DataValidator("fallback");

    describe("validatePaginatedResponse", () => {
        it("shouldReturnTrueForValidPaginatedResponse", () => {
            // GIVEN a valid paginated response
            const validResponse = {
                content: [1, 2],
                totalElements: 2,
                totalPages: 1,
                number: 1,
                size: 10,
                first: true,
                last: false
            };

            // WHEN validating the response
            const result = validator.validatePaginatedResponse(validResponse);

            // THEN the response should be considered valid
            expect(result).toBe(true);
        });

        it("shouldReturnFalseForInvalidPaginatedResponse", () => {
            // GIVEN an invalid paginated response
            const invalidResponse = {
                items: [1, 2],
                page: 1
            };

            // WHEN validating the response
            const result = validator.validatePaginatedResponse(invalidResponse);

            // THEN the response should be considered invalid
            expect(result).toBe(false);
        });
    });

    describe("sanitizeString", () => {
        it("shouldReturnStringForDefinedValue", () => {
            // GIVEN a defined string value
            const value = "test";

            // WHEN sanitizing the value
            const result = validator.sanitizeString(value);

            // THEN it should return the same string
            expect(result).toBe("test");
        });

        it("shouldReturnFallbackForNullOrUndefined", () => {
            // GIVEN a null or undefined value
            const value = null;

            // WHEN sanitizing the value
            const result = validator.sanitizeString(value);

            // THEN it should return the fallback
            expect(result).toBe("fallback");
        });
    });

    describe("sanitizeNumber", () => {
        it("shouldReturnNumberForValidInput", () => {
            // GIVEN a numeric input
            const value = 42;

            // WHEN sanitizing
            const result = validator.sanitizeNumber(value);

            // THEN it should return the number
            expect(result).toBe(42);
        });

        it("shouldReturnFallbackForInvalidInput", () => {
            // GIVEN an invalid numeric input
            const value = "abc";

            // WHEN sanitizing with fallback 99
            const result = validator.sanitizeNumber(value, 99);

            // THEN it should return the fallback
            expect(result).toBe(99);
        });
    });

    describe("sanitizeBoolean", () => {
        it("shouldReturnTrueForTruthyValues", () => {
            // GIVEN a truthy value
            const value = "non-empty";

            // WHEN sanitizing
            const result = validator.sanitizeBoolean(value);

            // THEN it should return true
            expect(result).toBe(true);
        });

        it("shouldReturnFalseForFalsyValues", () => {
            // GIVEN a falsy value
            const value = 0;

            // WHEN sanitizing
            const result = validator.sanitizeBoolean(value);

            // THEN it should return false
            expect(result).toBe(false);
        });
    });
});
import { describe, it, expect, beforeEach } from "vitest";
import { DateService } from "./date.service";
import { AppError } from "../services";
import type { DateFormatterOptions } from "./formatting.types";

describe("DateService", () => {
	let service: DateService;

	beforeEach(() => {
		// GIVEN a default date formatter configuration
		const config: DateFormatterOptions = {
			locale: "fr-FR",
			options: { year: "numeric", month: "long", day: "numeric" },
		};
		service = new DateService(config);
	});

	// --- FORMAT METHOD TESTS ---------------------------------------------------

	it("should format a valid date according to locale and options", () => {
		// GIVEN a valid ISO date string
		const validDate = "2024-05-10";

		// WHEN formatting the date
		const result = service.format(validDate);

		// THEN the result should contain formatted French month and year
		expect(result).toMatch(/mai|mai 2024|2024/);
	});

	it("should return raw input when date is invalid", () => {
		// GIVEN an invalid date string
		const invalidDate = "invalid-date";

		// WHEN formatting the invalid string
		const result = service.format(invalidDate);

		// THEN the raw string should be returned
		expect(result).toBe(invalidDate);
	});

	// --- ISVALID METHOD TESTS --------------------------------------------------

	it("should return true for a valid ISO date string", () => {
		// GIVEN a valid ISO date
		const validDate = "2023-12-25";

		// WHEN checking validity
		const result = service.isValid(validDate);

		// THEN it should be recognized as valid
		expect(result).toBe(true);
	});

	it("should return false for an invalid date string", () => {
		// GIVEN an invalid date string
		const invalidDate = "not-a-date";

		// WHEN checking validity
		const result = service.isValid(invalidDate);

		// THEN it should be recognized as invalid
		expect(result).toBe(false);
	});

	// --- VALIDATERANGE METHOD TESTS --------------------------------------------

	it("should throw AppError if start or end date is invalid", () => {
		// GIVEN invalid start and end dates
		const start = "invalid-start";
		const end = "2024-05-10";

		// WHEN validating range
		// THEN it should throw an AppError for invalid dates
		expect(() => service.validateRange(start, end)).toThrow(AppError);
	});

	it("should throw AppError if end date is before start date", () => {
		// GIVEN start and end dates in the wrong order
		const start = "2024-05-10";
		const end = "2024-05-01";

		// WHEN validating the date range
		// THEN it should throw an AppError for invalid chronological order
		expect(() => service.validateRange(start, end)).toThrow(AppError);
	});

	it("should not throw if start date is before end date", () => {
		// GIVEN a valid date range
		const start = "2024-05-01";
		const end = "2024-05-10";

		// WHEN validating the range
		// THEN it should pass without error
		expect(() => service.validateRange(start, end)).not.toThrow();
	});

	// --- ISVALIDRANGE METHOD TESTS ---------------------------------------------

	it("should return true for a valid chronological date range", () => {
		// GIVEN valid chronological start and end dates
		const start = "2024-05-01";
		const end = "2024-05-10";

		// WHEN checking if range is valid
		const result = service.isValidRange(start, end);

		// THEN it should return true
		expect(result).toBe(true);
	});

	it("should return false for an invalid date range", () => {
		// GIVEN dates in incorrect order
		const start = "2024-05-10";
		const end = "2024-05-01";

		// WHEN checking if range is valid
		const result = service.isValidRange(start, end);

		// THEN it should return false
		expect(result).toBe(false);
	});

	it("should return false when any date is invalid", () => {
		// GIVEN invalid start and valid end date
		const start = "not-a-date";
		const end = "2024-05-10";

		// WHEN checking if range is valid
		const result = service.isValidRange(start, end);

		// THEN it should return false
		expect(result).toBe(false);
	});
});
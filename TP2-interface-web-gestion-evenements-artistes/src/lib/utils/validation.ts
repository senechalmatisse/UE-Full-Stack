import type { PaginationParams } from '$lib/types/pagination';

/**
 * Validator for pagination parameters.
 *
 * Ensures that `page` and `size` parameters fall within valid ranges,
 * and provides conversion utilities between client (1-indexed) and
 * API (0-indexed) pagination systems.
 */
export class PaginationValidator {
	private readonly minSize: number;
	private readonly maxSize: number;

	/**
	 * Creates a new PaginationValidator instance.
	 *
	 * @param minSize - Minimum allowed page size (default: 1).
	 * @param maxSize - Maximum allowed page size (default: 50).
	 *
	 * @example
	 * ```ts
	 * const validator = new PaginationValidator(2, 100);
	 * ```
	 */
	constructor(minSize = 1, maxSize = 50) {
		this.minSize = minSize;
		this.maxSize = maxSize;
	}

	/**
	 * Validates and normalizes pagination parameters.
	 *
	 * - Ensures the page number is at least 1.
	 * - Ensures the page size is between `minSize` and `maxSize`.
	 *
	 * @param pageParam - Raw page parameter (string or null).
	 * @param sizeParam - Raw size parameter (string or null).
	 * @returns Normalized pagination parameters.
	 *
	 * @example
	 * ```ts
	 * const { page, size } = validator.validate("2", "20");
	 * // => { page: 2, size: 20 }
	 * ```
	 */
	validate(pageParam: string | null, sizeParam: string | null): PaginationParams {
		const page = Math.max(1, Number(pageParam) || 1);
		const size = Math.min(
			this.maxSize, 
			Math.max(this.minSize, Number(sizeParam) || 4)
		);

		return { page, size };
	}

	/**
	 * Converts a client-side page number (1-indexed)
	 * into an API-compatible page number (0-indexed).
	 *
	 * @param page - Client page number (>= 1).
	 * @returns API page number (>= 0).
	 *
	 * @example
	 * ```ts
	 * validator.toApiPage(1); // => 0
	 * validator.toApiPage(5); // => 4
	 * ```
	 */
	toApiPage(page: number): number {
		return Math.max(0, page - 1);
	}

	/**
	 * Converts an API page number (0-indexed)
	 * into a client-side page number (1-indexed).
	 *
	 * @param apiPage - API page number (>= 0).
	 * @returns Client page number (>= 1).
	 *
	 * @example
	 * ```ts
	 * validator.fromApiPage(0); // => 1
	 * validator.fromApiPage(4); // => 5
	 * ```
	 */
	fromApiPage(apiPage: number): number {
		return Math.max(1, apiPage + 1);
	}
}

/**
 * Validator for API response data.
 *
 * Provides utilities for validating the structure of paginated responses
 * and sanitizing values into safe, type-consistent representations.
 */
export class DataValidator {

	/**
	 * Validates whether a data object matches the structure
	 * of a paginated API response.
	 *
	 * @typeParam T - The type of items contained in the response.
	 * @param data - The data object to validate.
	 * @returns True if the response matches the expected structure, false otherwise.
	 *
	 * @example
	 * ```ts
	 * if (DataValidator.validatePaginatedResponse<User>(response)) {
	 *   console.log(response.content); // Typed as User[]
	 * }
	 * ```
	 */
	static validatePaginatedResponse<T>(data: any): data is {
		content: T[];
		totalElements: number;
		totalPages: number;
		number: number;
		size: number;
		first: boolean;
		last: boolean;
	} {
		return (
			data &&
			typeof data === 'object' &&
			Array.isArray(data.content) &&
			typeof data.totalElements === 'number' &&
			typeof data.totalPages === 'number' &&
			typeof data.number === 'number' &&
			typeof data.size === 'number' &&
			typeof data.first === 'boolean' &&
			typeof data.last === 'boolean'
		);
	}

	/**
	 * Sanitizes a value into a string.
	 *
	 * Converts `null` or `undefined` into a fallback string.
	 *
	 * @param value - The input value.
	 * @param fallback - The fallback string if value is null/undefined (default: `""`).
	 * @returns A string representation of the value or the fallback.
	 *
	 * @example
	 * ```ts
	 * DataValidator.sanitizeString(null, "N/A"); // => "N/A"
	 * ```
	 */
	static sanitizeString(value: any, fallback = ''): string {
		return String(value || fallback);
	}

	/**
	 * Sanitizes a value into a number.
	 *
	 * Converts invalid or nullish values into a numeric fallback.
	 *
	 * @param value - The input value.
	 * @param fallback - The fallback number if parsing fails (default: 0).
	 * @returns A numeric value or the fallback.
	 *
	 * @example
	 * ```ts
	 * DataValidator.sanitizeNumber("42"); // => 42
	 * DataValidator.sanitizeNumber(undefined, 10); // => 10
	 * ```
	 */
	static sanitizeNumber(value: any, fallback = 0): number {
		return Number(value) || fallback;
	}

	/**
	 * Sanitizes a value into a boolean.
	 *
	 * Converts truthy values into `true` and falsy values into `false`.
	 *
	 * @param value - The input value.
	 * @returns True if the value is truthy, false otherwise.
	 *
	 * @example
	 * ```ts
	 * DataValidator.sanitizeBoolean("yes"); // => true
	 * DataValidator.sanitizeBoolean(0); // => false
	 * ```
	 */
	static sanitizeBoolean(value: any): boolean {
		return Boolean(value);
	}
}
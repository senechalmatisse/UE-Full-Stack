import type { PaginationParams } from '../types/pagination';

/**
 * Validator for pagination parameters.
 *
 * Ensures that page and size parameters are within valid ranges
 * and provides conversion utilities between client (1-indexed)
 * and API (0-indexed) pagination systems.
 */
export class PaginationValidator {
	private readonly minSize: number;
	private readonly maxSize: number;

	/**
	 * Creates a new PaginationValidator.
	 *
	 * @param minSize - Minimum allowed page size (default: 1).
	 * @param maxSize - Maximum allowed page size (default: 50).
	 */
	constructor(minSize = 1, maxSize = 50) {
		this.minSize = minSize;
		this.maxSize = maxSize;
	}

	/**
	 * Validates and normalizes pagination parameters.
	 *
	 * - Ensures the page is at least 1.
	 * - Ensures the size is between minSize and maxSize.
	 *
	 * @param pageParam - Raw page parameter (string or null).
	 * @param sizeParam - Raw size parameter (string or null).
	 * @returns Normalized pagination parameters.
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
	 */
	fromApiPage(apiPage: number): number {
		return Math.max(1, apiPage + 1);
	}
}

/**
 * Validator for API response data.
 *
 * Provides utilities for validating paginated responses
 * and sanitizing values into safe types.
 */
export class DataValidator {
	/**
	 * Validates the structure of a paginated API response.
	 *
	 * @template T - The type of items contained in the response.
	 * @param data - The data object to validate.
	 * @returns True if the response matches the expected structure.
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
	 * @param value - The input value.
	 * @param fallback - The fallback string if value is null/undefined (default: '').
	 * @returns A string representation of the value or the fallback.
	 */
	static sanitizeString(value: any, fallback = ''): string {
		return String(value || fallback);
	}

	/**
	 * Sanitizes a value into a number.
	 *
	 * @param value - The input value.
	 * @param fallback - The fallback number if parsing fails (default: 0).
	 * @returns A numeric value or the fallback.
	 */
	static sanitizeNumber(value: any, fallback = 0): number {
		return Number(value) || fallback;
	}

	/**
	 * Sanitizes a value into a boolean.
	 *
	 * @param value - The input value.
	 * @returns True if the value is truthy, false otherwise.
	 */
	static sanitizeBoolean(value: any): boolean {
		return Boolean(value);
	}
}
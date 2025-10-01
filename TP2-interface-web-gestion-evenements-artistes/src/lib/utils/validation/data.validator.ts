import type { IDataValidator } from './interfaces';

/**
 * Validator for API response data.
 *
 * Provides utilities for validating the structure of paginated responses
 * and sanitizing values into safe, type-consistent representations.
 */
export class DataValidator implements IDataValidator {
    constructor(private readonly emptyFallback: string = '') {}

	/**
	 * Validates whether a data object matches the structure
	 * of a paginated API response.
	 *
	 * @typeParam T - The type of items contained in the response.
	 * @param data - The data object to validate.
	 * @returns True if the response matches the expected structure, false otherwise.
	 */
    validatePaginatedResponse<T>(data: any): data is {
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
	 */
    sanitizeString(value: any, fallback = this.emptyFallback): string {
        return String(value ?? fallback);
    }

	/**
	 * Sanitizes a value into a number.
	 *
	 * Converts invalid or nullish values into a numeric fallback.
	 *
	 * @param value - The input value.
	 * @param fallback - The fallback number if parsing fails (default: 0).
	 * @returns A numeric value or the fallback.
	 */
    sanitizeNumber(value: any, fallback = 0): number {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

	/**
	 * Sanitizes a value into a boolean.
	 *
	 * Converts truthy values into `true` and falsy values into `false`.
	 *
	 * @param value - The input value.
	 * @returns True if the value is truthy, false otherwise.
	 */
    sanitizeBoolean(value: any): boolean {
        return Boolean(value);
    }
}
/**
 * Interface defining validation and sanitization utilities
 * for API data and user input.
 *
 * Provides type-safe methods to validate paginated API responses
 * and sanitize values into consistent and safe primitives.
 */
export interface IDataValidator {
    /**
     * Validates that a given object conforms to the structure
     * of a paginated API response.
     *
     * @typeParam T - The type of data items contained in the response.
     * @param data - The data object to validate.
     * @returns True if the object matches the expected structure, otherwise false.
     */
    validatePaginatedResponse<T>(data: any): data is {
        content: T[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
        first: boolean;
        last: boolean;
    };

    /**
     * Sanitizes an arbitrary value into a string.
     *
     * @param value - The input value.
     * @param fallback - The fallback string if the value is null or undefined.
     * @returns A sanitized string.
     */
    sanitizeString(value: any, fallback?: string): string;

    /**
     * Sanitizes an arbitrary value into a number.
     *
     * @param value - The input value.
     * @param fallback - The fallback number if the input is invalid or not numeric.
     * @returns A sanitized number.
     */
    sanitizeNumber(value: any, fallback?: number): number;

    /**
     * Sanitizes an arbitrary value into a boolean.
     *
     * @param value - The input value.
     * @returns A boolean representation of the input.
     */
    sanitizeBoolean(value: any): boolean;
}
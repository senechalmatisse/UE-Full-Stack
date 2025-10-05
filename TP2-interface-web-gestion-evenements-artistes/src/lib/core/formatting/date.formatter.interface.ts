/**
 * @fileoverview
 * Interface defining date formatting and validation operations.
 *
 * Implementations should provide locale-aware behavior and consistent
 * error handling for date parsing and range validation.
 */

/**
 * Defines the contract for any class providing date formatting and validation.
 */
export interface IDateFormatter {
    /**
     * Formats a given date string according to a locale and formatting options.
     *
     * @param dateString - A date string (ISO-8601 or any valid format for `Date`).
     * @returns A localized and human-readable date string.
     */
    format(dateString: string): string;

    /**
     * Checks whether a given date string represents a valid date.
     *
     * @param dateString - The date string to validate.
     * @returns `true` if valid, otherwise `false`.
     */
    isValid(dateString: string): boolean;

    /**
     * Validates a start and end date range.
     *
     * Throws an {@link AppError} if either date is invalid or if
     * the end date is earlier than the start date.
     *
     * @param startDate - The start date string.
     * @param endDate - The end date string.
     * @throws AppError if the dates are invalid or out of range.
     */
    validateRange(startDate: string, endDate: string): void;

    /**
     * Checks whether two dates form a valid chronological range.
     *
     * @param startDate - The start date string.
     * @param endDate - The end date string.
     * @returns `true` if valid, otherwise `false`.
     */
    isValidRange(startDate: string, endDate: string): boolean;
}
import { AppError } from "../services";
import type { IDateFormatter } from "./date.formatter.interface";
import type { DateFormatterOptions } from "./formatting.types";

/**
 * @fileoverview
 * Provides locale-aware date formatting, validation, and range checking.
 *
 * The {@link DateService} encapsulates all logic related to date parsing and
 * formatting to ensure consistent behavior across the application.
 */

/**
 * Utility class for locale-aware date formatting and validation.
 *
 * Encapsulates formatting logic with built-in validation and
 * application-specific error handling.
 *
 * @implements {IDateFormatter}
 */
export class DateService implements IDateFormatter {
    constructor(private config: DateFormatterOptions) {}

    /**
     * Formats a date string using the configured locale and options.
     *
     * Falls back to returning the raw input if the string is not a valid date.
     *
     * @param dateString - The date string (ISO-8601 or similar).
     * @returns The formatted date string, or the raw input if invalid.
     */
    format(dateString: string): string {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString(this.config.locale, this.config.options);
    }

    /**
     * Determines whether a given date string is valid.
     *
     * @param dateString - The date string to validate.
     * @returns `true` if valid, otherwise `false`.
     */
    isValid(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * Validates that both dates are valid and that the start date
     * occurs before the end date.
     *
     * @param startDate - The starting date string.
     * @param endDate - The ending date string.
     * @throws AppError if either date is invalid or out of order.
     */
    validateRange(startDate: string, endDate: string): void {
        if (!this.isValid(startDate) || !this.isValid(endDate)) {
            throw new AppError(400, "Les dates doivent être valides");
        }
        if (new Date(startDate) >= new Date(endDate)) {
            throw new AppError(400, "La date de fin doit être après celle du début");
        }
    }

    /**
     * Checks if the provided date range is valid without throwing errors.
     *
     * @param startDate - The start date string.
     * @param endDate - The end date string.
     * @returns `true` if valid, otherwise `false`.
     */
    isValidRange(startDate: string, endDate: string): boolean {
        try {
            this.validateRange(startDate, endDate);
            return true;
        } catch {
            return false;
        }
    }
}
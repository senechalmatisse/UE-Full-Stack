import type { IDateFormatter, IDateFormatterConfig } from "./date.formatter.interface";
import { AppError } from "$lib/services/api.error";

/**
 * Utility class for locale-aware date formatting and validation.
 *
 * Encapsulates date formatting logic with error handling to ensure
 * consistency across the application.
 */
export class DateFormatter implements IDateFormatter {
    constructor(private config: IDateFormatterConfig) {}

	/**
	 * Formats a date string using the configured locale and options.
	 *
	 * Falls back to returning the raw input if the string is not a valid date.
	 *
	 * @param dateString - The date string (ISO-8601 or other format supported by `Date`).
	 * @returns The formatted date string, or the raw input if invalid.
	 */
    format(dateString: string): string {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) throw new AppError(400, "Date invalide");
            return date.toLocaleDateString(this.config.locale, this.config.options);
        } catch {
            return dateString;
        }
    }

	/**
	 * Validates whether a string is a valid date.
	 *
	 * @param dateString - The date string to validate.
	 * @returns `true` if the string is a valid date, otherwise `false`.
	 */
    isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
}
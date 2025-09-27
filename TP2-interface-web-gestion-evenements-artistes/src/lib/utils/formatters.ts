import { AppError } from '$lib/services/api.error';
import type { DateFormatterOptions } from '../types/pagination';

/**
 * Generic date formatter.
 *
 * Encapsulates locale-aware date formatting logic and validation,
 * following the Single Responsibility Principle.
 */
export class DateFormatter {
	private locale: string;
	private options: Intl.DateTimeFormatOptions;

	/**
	 * Creates a new DateFormatter instance.
	 *
	 * @param locale - The locale used for formatting (e.g., "fr-FR").
	 * @param options - Intl date formatting options.
	 */
	constructor({ locale, options }: DateFormatterOptions) {
		this.locale = locale;
		this.options = options;
	}

	/**
	 * Formats a date string using the configured locale and options.
	 *
	 * @param dateString - The date string (ISO-8601 or other format supported by `Date`).
	 * @returns A formatted date string or the raw input if invalid.
	 */
	format(dateString: string): string {
		try {
			const date = new Date(dateString);

			if (isNaN(date.getTime())) {
                throw new AppError(400, "Date invalide");
			}

			return date.toLocaleDateString(this.locale, this.options);
		} catch (error) {
			return dateString; // Fallback to raw input
		}
	}

	/**
	 * Validates whether a string is a valid date.
	 *
	 * @param dateString - The date string to validate.
	 * @returns True if the string is a valid date, false otherwise.
	 */
	isValidDate(dateString: string): boolean {
		try {
			const date = new Date(dateString);
			return !isNaN(date.getTime());
		} catch {
			return false;
		}
	}
}

/**
 * Factory class for creating and reusing date formatters.
 *
 * Provides predefined and custom formatters to ensure consistency.
 */
export class DateFormatterFactory {
	private static formatters = new Map<string, DateFormatter>();

	/**
	 * Returns a French date formatter with a long format.
	 * Reuses the same instance across calls (singleton pattern).
	 *
	 * @returns A DateFormatter configured for French locale.
	 */
	static getFrenchFormatter(): DateFormatter {
		const key = 'fr-FR-long';

		if (!this.formatters.has(key)) {
			this.formatters.set(
				key,
				new DateFormatter({
					locale: 'fr-FR',
					options: {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					}
				})
			);
		}

		return this.formatters.get(key)!;
	}

	/**
	 * Creates a new custom date formatter.
	 *
	 * @param config - Date formatter configuration (locale and options).
	 * @returns A new DateFormatter instance.
	 */
	static createFormatter(config: DateFormatterOptions): DateFormatter {
		return new DateFormatter(config);
	}
}

/**
 * Utility class for pagination calculations and display helpers.
 */
export class PaginationUtils {
	/**
	 * Computes the visible page numbers for pagination navigation.
	 *
	 * @param currentPage - The current page number (1-based).
	 * @param totalPages - The total number of pages available.
	 * @param maxVisible - Maximum number of visible pages (default: 7).
	 * @returns An array of visible page numbers.
	 */
	static getVisiblePages(
		currentPage: number,
		totalPages: number,
		maxVisible = 7
	): number[] {
		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);
		const adjustedStart = Math.max(1, end - maxVisible + 1);

		return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
	}

	/**
	 * Generates a human-readable pagination info string.
	 *
	 * @param page - The current page number.
	 * @param totalPages - The total number of available pages.
	 * @returns A string in the format: "Page X sur Y".
	 */
	static getPaginationInfo(page: number, totalPages: number): string {
		return `Page ${page} sur ${totalPages}`;
	}
}

/**
 * Manager for tracking and broadcasting loading state.
 *
 * Provides a pub/sub mechanism for components to react
 * to loading or error state changes.
 */
export class LoadingStateManager {
	private isLoading = false;
	private error: string | null = null;
	private callbacks: Array<(state: { isLoading: boolean; error: string | null }) => void> = [];

	/**
	 * Starts the loading state (resets error).
	 */
	startLoading(): void {
		this.isLoading = true;
		this.error = null;
		this.notifySubscribers();
	}

	/**
	 * Stops the loading state successfully (no error).
	 */
	stopLoading(): void {
		this.isLoading = false;
		this.error = null;
		this.notifySubscribers();
	}

	/**
	 * Stops the loading state and sets an error message.
	 *
	 * @param error - The error message.
	 */
	setError(error: string): void {
		this.isLoading = false;
		this.error = error;
		this.notifySubscribers();
	}

	/**
	 * Resets the state (no loading, no error).
	 */
	reset(): void {
		this.isLoading = false;
		this.error = null;
		this.notifySubscribers();
	}

	/**
	 * Returns the current state snapshot.
	 *
	 * @returns The current loading state and error.
	 */
	getState() {
		return {
			isLoading: this.isLoading,
			error: this.error
		};
	}

	/**
	 * Subscribes to state changes.
	 *
	 * @param callback - Function to call when state changes.
	 * @returns A function to unsubscribe.
	 */
	subscribe(callback: (state: { isLoading: boolean; error: string | null }) => void): () => void {
		this.callbacks.push(callback);

		// Return an unsubscribe function
		return () => {
			const index = this.callbacks.indexOf(callback);
			if (index > -1) {
				this.callbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Notifies all subscribers of the current state.
	 */
	private notifySubscribers(): void {
		const state = this.getState();
		this.callbacks.forEach(callback => callback(state));
	}
}
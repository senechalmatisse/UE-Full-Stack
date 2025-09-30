import { AppError } from '$lib/services/api.error';
import type { DateFormatterOptions } from '$lib/types/pagination';

/**
 * Utility class for locale-aware date formatting and validation.
 *
 * Encapsulates date formatting logic with error handling to ensure
 * consistency across the application.
 *
 * @example
 * ```ts
 * const formatter = new DateFormatter({
 *   locale: "fr-FR",
 *   options: { year: "numeric", month: "long", day: "numeric" }
 * });
 *
 * formatter.format("2025-03-01"); // "1 mars 2025"
 * ```
 */
export class DateFormatter {
	private locale: string;
	private options: Intl.DateTimeFormatOptions;

	/**
	 * Creates a new {@link DateFormatter} instance.
	 *
	 * @param locale - The locale used for formatting (e.g., `"fr-FR"`).
	 * @param options - Intl date formatting options.
	 */
	constructor({ locale, options }: DateFormatterOptions) {
		this.locale = locale;
		this.options = options;
	}

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

			if (isNaN(date.getTime())) {
                throw new AppError(400, "Date invalide");
			}

			return date.toLocaleDateString(this.locale, this.options);
		} catch (error) {
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
		try {
			const date = new Date(dateString);
			return !isNaN(date.getTime());
		} catch {
			return false;
		}
	}
}

/**
 * Factory class for creating and reusing {@link DateFormatter} instances.
 *
 * Implements a simple caching mechanism for common formatters
 * (e.g., French long-date format).
 */
export class DateFormatterFactory {
	private static formatters = new Map<string, DateFormatter>();

	/**
	 * Returns a reusable French long-date formatter.
	 *
	 * Uses a singleton-like approach to avoid creating multiple
	 * identical instances.
	 *
	 * @returns A {@link DateFormatter} configured for French locale.
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
	 * @param config - The date formatter configuration (locale and options).
	 * @returns A new {@link DateFormatter} instance.
	 */
	static createFormatter(config: DateFormatterOptions): DateFormatter {
		return new DateFormatter(config);
	}
}

/**
 * Utility class providing helper methods for pagination display
 * and navigation logic.
 */
export class PaginationUtils {
	/**
	 * Computes the visible page numbers for pagination navigation.
	 *
	 * Automatically adjusts the range to ensure it stays within
	 * valid page bounds.
	 *
	 * @param currentPage - The current page number (1-based).
	 * @param totalPages - The total number of pages available.
	 * @param maxVisible - Maximum number of visible pages (default: `5`).
	 * @returns An array of visible page numbers.
	 *
	 * @example
	 * ```ts
	 * PaginationUtils.getVisiblePages(5, 20, 7);
	 * // => [2, 3, 4, 5, 6]
	 * ```
	 */
	static getVisiblePages(
		currentPage: number,
		totalPages: number,
		maxVisible = 5
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
	 * @param totalPages - The total number of pages available.
	 * @returns A string in the format: `"Page X sur Y"`.
	 */
	static getPaginationInfo(page: number, totalPages: number): string {
		return `Page ${page} sur ${totalPages}`;
	}
}

/**
 * Manager for tracking and broadcasting loading state.
 *
 * Provides a publish/subscribe mechanism for components
 * to react to loading or error state changes.
 *
 * @example
 * ```ts
 * const manager = new LoadingStateManager();
 *
 * const unsubscribe = manager.subscribe((state) => {
 *   console.log("Loading:", state.isLoading, "Error:", state.error);
 * });
 *
 * manager.startLoading();
 * manager.setError("Something went wrong");
 * manager.stopLoading();
 * unsubscribe();
 * ```
 */
export class LoadingStateManager {
	private isLoading = false;
	private error: string | null = null;
	private callbacks: Array<(state: { isLoading: boolean; error: string | null }) => void> = [];

	/** Starts the loading state and clears any previous error. */
	startLoading(): void {
		this.isLoading = true;
		this.error = null;
		this.notifySubscribers();
	}

	/** Stops the loading state successfully (clears error). */
	stopLoading(): void {
		this.isLoading = false;
		this.error = null;
		this.notifySubscribers();
	}

	/**
	 * Stops the loading state and records an error message.
	 *
	 * @param error - The error message.
	 */
	setError(error: string): void {
		this.isLoading = false;
		this.error = error;
		this.notifySubscribers();
	}

	/** Resets both loading and error states. */
	reset(): void {
		this.isLoading = false;
		this.error = null;
		this.notifySubscribers();
	}

	/**
	 * Returns the current state snapshot.
	 *
	 * @returns An object containing `isLoading` and `error`.
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
	 * @param callback - Function to call whenever state changes.
	 * @returns A cleanup function to unsubscribe.
	 */
	subscribe(callback: (state: { isLoading: boolean; error: string | null }) => void): () => void {
		this.callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = this.callbacks.indexOf(callback);
			if (index > -1) {
				this.callbacks.splice(index, 1);
			}
		};
	}

	/** Notifies all subscribers with the current state. */
	private notifySubscribers(): void {
		const state = this.getState();
		this.callbacks.forEach(callback => callback(state));
	}
}
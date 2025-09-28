import type { Artist, Event, PaginatedResponse } from '$lib/types/pagination';
import { DataValidator } from '$lib/utils/validation';

/**
 * Centralized sanitizer for domain entities.
 *
 * Provides reusable, type-safe functions to validate and sanitize
 * raw API data before it is consumed by the application.
 *
 * Ensures that missing or malformed fields are replaced with safe defaults.
 */
export class Sanitizer {
	/**
	 * Sanitizes a raw artist object.
	 *
	 * Replaces missing or invalid fields with safe default values.
	 *
	 * @param raw - The raw artist data from the API.
	 * @returns A sanitized {@link Artist} object.
	 *
	 * @example
	 * ```ts
	 * const raw = { id: null, label: undefined };
	 * const artist = Sanitizer.artist(raw);
	 * // => { id: "", label: "Artiste inconnu(e)" }
	 * ```
	 */
	static artist(raw: any): Artist {
		return {
			id: DataValidator.sanitizeString(raw?.id),
			label: DataValidator.sanitizeString(raw?.label, 'Artiste inconnu(e)')
		};
	}

	/**
	 * Sanitizes a raw event object.
	 *
	 * Ensures event metadata (ID, label, dates, and artists) is
	 * properly validated and fallback values are provided when needed.
	 *
	 * @param raw - The raw event data from the API.
	 * @returns A sanitized {@link Event} object.
	 *
	 * @example
	 * ```ts
	 * const raw = { id: "1", label: null, artists: [{}] };
	 * const event = Sanitizer.event(raw);
	 * // => {
	 * //   id: "1",
	 * //   label: "Événement sans titre",
	 * //   startDate: "",
	 * //   endDate: "",
	 * //   artists: [{ id: "", label: "Artiste inconnu(e)" }]
	 * // }
	 * ```
	 */
	static event(raw: any): Event {
		return {
			id: DataValidator.sanitizeString(raw?.id),
			label: DataValidator.sanitizeString(raw?.label, 'Événement sans titre'),
			startDate: DataValidator.sanitizeString(raw?.startDate),
			endDate: DataValidator.sanitizeString(raw?.endDate),
			artists: Array.isArray(raw?.artists)
				? raw.artists.map((a: any) => Sanitizer.artist(a))
				: []
		};
	}

	/**
	 * Sanitizes a generic paginated response.
	 *
	 * Applies a given sanitizer function to each item in the
	 * paginated content array.
	 *
	 * @typeParam T - The type of items after sanitization.
	 * @param response - The raw paginated response from the API.
	 * @param fn - The sanitizer function to apply to each item.
	 * @returns A sanitized {@link PaginatedResponse} with transformed items.
	 *
	 * @example
	 * ```ts
	 * const rawResponse = {
	 *   content: [{ id: null, label: null }],
	 *   totalPages: 1,
	 *   totalElements: 1
	 * };
	 *
	 * const sanitized = Sanitizer.paginated(rawResponse, Sanitizer.artist);
	 * // => { content: [{ id: "", label: "Artiste inconnu(e)" }], totalPages: 1, totalElements: 1 }
	 * ```
	 */
	static paginated<T>(
        response: PaginatedResponse<any>,
        fn: (raw: any) => T
    ): PaginatedResponse<T> {
		return {
			...response,
			content: response.content.map((item: any) => fn(item))
		};
	}
}
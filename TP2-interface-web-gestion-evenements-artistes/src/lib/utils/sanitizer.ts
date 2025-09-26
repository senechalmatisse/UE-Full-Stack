import type { Artist, Event, PaginatedResponse } from '../types/pagination';
import { DataValidator } from '../utils/validation';

/**
 * Centralized sanitizer for domain entities.
 * Provides reusable functions to validate and sanitize raw API data.
 */
export class Sanitizer {
	/** Sanitize a single artist */
	static artist(raw: any): Artist {
		return {
			id: DataValidator.sanitizeString(raw?.id),
			label: DataValidator.sanitizeString(raw?.label, 'Artiste inconnue')
		};
	}

	/** Sanitize a single event */
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
	 * Generic sanitizer for paginated responses.
	 *
	 * @param response - The raw paginated response
	 * @param fn - The sanitizer function for each item
	 */
	static paginated<T>(response: PaginatedResponse<any>, fn: (raw: any) => T): PaginatedResponse<T> {
		return {
			...response,
			content: response.content.map((item: any) => fn(item))
		};
	}
}
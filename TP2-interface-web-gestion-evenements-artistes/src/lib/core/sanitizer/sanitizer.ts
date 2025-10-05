import type { Artist, Event } from '../domain';
import type { PaginatedResponse } from '../pagination';
import type { ILabelProvider } from './label-provider.interface';
import type { IDataValidator } from '../validation';

/**
 * @displayName Sanitizer
 * @public
 *
 * Centralized sanitizer for all domain entities.
 *
 * Ensures that raw API or external data is validated and normalized
 * before being consumed by the application.
 *
 * Depends exclusively on abstractions: {@link IDataValidator} and {@link ILabelProvider}.
 */
export class Sanitizer {
    constructor(
        private readonly validator: IDataValidator,
        private readonly config: ILabelProvider
    ) {}

	/**
	 * Sanitizes a raw artist object.
	 *
	 * Ensures all fields are valid and fallbacks to the configured
	 * default label if necessary.
	 *
	 * @param raw - The raw artist data to sanitize.
	 * @returns A sanitized {@link Artist} object.
	 */
    artist(raw: any): Artist {
        return {
            id: this.validator.sanitizeString(raw?.id),
            label: this.validator.sanitizeString(
                raw?.label,
                this.config.getDefaultArtistLabel()
            )
        };
    }

	/**
	 * Sanitizes a raw event object, including its nested artist data.
	 *
	 * Ensures all fields are valid and normalized.
	 *
	 * @param raw - The raw event data to sanitize.
	 * @returns A sanitized {@link Event} object.
	 */
    event(raw: any): Event {
        return {
            id: this.validator.sanitizeString(raw?.id),
            label: this.validator.sanitizeString(
                raw?.label,
                this.config.getDefaultEventLabel()
            ),
            startDate: this.validator.sanitizeString(raw?.startDate),
            endDate: this.validator.sanitizeString(raw?.endDate),
            artists: Array.isArray(raw?.artists)
                ? raw.artists.map((a: any) => this.artist(a))
                : []
        };
    }

	/**
	 * Sanitizes a paginated API response by applying a transformation function
	 * to each item of the content list.
	 *
	 * @typeParam T - The type of the sanitized entity.
	 *
	 * @param response - The raw paginated response to sanitize.
	 * @param fn - The function used to sanitize each individual item.
	 * @returns A sanitized {@link PaginatedResponse} with normalized content.
	 */
    paginated<T>(
        response: PaginatedResponse<any>,
        fn: (raw: any) => T
    ): PaginatedResponse<T> {
        return {
            ...response,
            content: response.content.map((item: any) => fn(item))
        };
    }
}
import type { Artist, Event, PaginatedResponse } from '$lib/types/pagination';
import type { IValidator, IConfigProvider } from './interfaces';

/**
 * Centralized sanitizer pour toutes les entités.
 * Dépend uniquement d’abstractions (IValidator + IConfigProvider)
 */
export class Sanitizer {
    constructor(
        private readonly validator: IValidator,
        private readonly config: IConfigProvider
    ) {}

    artist(raw: any): Artist {
        return {
            id: this.validator.sanitizeString(raw?.id),
            label: this.validator.sanitizeString(
                raw?.label,
                this.config.getDefaultArtistLabel()
            )
        };
    }

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

    paginated<T>(response: PaginatedResponse<any>, fn: (raw: any) => T): PaginatedResponse<T> {
        return {
            ...response,
            content: response.content.map((item: any) => fn(item))
        };
    }
}
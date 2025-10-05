import type { Event } from '../domain';
import { BaseService } from './base.service';
import { ApiServiceFactory } from './api.service';

/**
 * Service responsible for managing Event entities.
 *
 * Extends the {@link BaseService} to inherit common CRUD operations
 * and provides additional methods specific to event-related operations.
 */
export class EventService extends BaseService<Event> {
	constructor() {
		super(ApiServiceFactory.create<Event>('event'));
	}

	/**
	 * Associate an artist with a given event.
	 *
	 * @param eventId - The unique identifier of the event.
	 * @param artistId - The unique identifier of the artist.
	 *
	 * @throws {Error} If the request fails.
	 */
	async addArtistToEvent(
        eventId: string,
        artistId: string
    ): Promise<void> {
		try {
			await this.apiService.request<void>(
				`events/${eventId}/artists/${artistId}`,
				{ method: 'POST' }
			);
		} catch (err: any) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Remove an artist from a given event.
	 *
	 * @param eventId - The unique identifier of the event.
	 * @param artistId - The unique identifier of the artist.
	 *
	 * @throws {Error} If the request fails.
	 */
	async removeArtistFromEvent(
        eventId: string,
        artistId: string
    ): Promise<void> {
		try {
			await this.apiService.request<void>(
				`events/${eventId}/artists/${artistId}`,
				{ method: 'DELETE' }
			);
		} catch (err: any) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Sanitize a raw Event entity returned by the API.
	 *
	 * @param raw - The raw event data returned by the API.
	 * @returns A sanitized {@link Event} object.
	 */
	protected sanitize(raw: any): Event {
        return this.sanitizer.event(raw);
	}
}

/**
 * Factory function to create a new {@link EventService} instance.
 *
 * @returns A fresh instance of {@link EventService}.
 */
export function createEventService(): EventService {
	return new EventService();
}
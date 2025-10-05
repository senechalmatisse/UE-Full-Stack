import type { Artist, Event } from '../domain';
import { ApiServiceFactory } from './api.service';
import { BaseService } from './base.service';

/**
 * Service responsible for managing Artist entities.
 *
 * Extends the {@link BaseService} to inherit common CRUD operations
 * and provides additional methods specific to artist-related operations.
 */
export class ArtistService extends BaseService<Artist> {
	constructor() {
		super(ApiServiceFactory.create<Artist>('artist'));
	}

	/**
	 * Fetch all events associated with a given artist.
	 *
	 * @param id - The unique identifier of the artist.
	 * @returns A list of sanitized {@link Event} objects linked to the artist.
	 *
	 * @throws {Error} If the request fails.
	 */
	async getArtistEvents(id: string): Promise<Event[]> {
		try {
			const events = await this.apiService.request<Event[]>(`artists/${id}/events`);
			return (events ?? []).map((e) => this.sanitizer.event(e));
		} catch (err) {
			this.handleError(err, 'notFound');
		}
	}

	/**
	 * Sanitize a raw Artist entity returned by the API.
	 *
	 * @param raw - The raw artist data returned by the API.
	 * @returns A sanitized {@link Artist} object.
	 */
	protected sanitize(raw: any): Artist {
        return this.sanitizer.artist(raw);
	}
}

/**
 * Factory function to create a new {@link ArtistService} instance.
 *
 * @returns A fresh instance of {@link ArtistService}.
 */
export function createArtistService(): ArtistService {
	return new ArtistService();
}
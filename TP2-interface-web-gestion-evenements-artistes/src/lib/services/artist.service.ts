import type { Artist } from '../types/pagination';
import { DataValidator } from '../utils/validation';
import { ApiService } from './api.service';

/**
 * Specialized service for handling artist-related data.
 *
 * Implements the Single Responsibility Principle by focusing only
 * on artist-specific logic such as validation and sanitization.
 */
export class ArtistService {
	private apiService: ApiService<Artist>;

	/**
	 * Creates a new ArtistService instance.
	 *
	 * @param apiService - The API service responsible for fetching artist data.
	 */
	constructor(apiService: ApiService<Artist>) {
		this.apiService = apiService;
	}

	/**
	 * Retrieves an artist by its ID from the API.
	 *
	 * @param id - The unique identifier of the artist.
	 * @returns A sanitized Artist object.
	 */
	async getArtistById(id: string): Promise<Artist> {
		const artist = await this.apiService.request<Artist>(`artists/${id}`);
		return this.sanitizeArtist(artist);
	}

	/**
	 * Sanitizes and validates a single artist object.
	 *
	 * Ensures that IDs and labels are safe strings.
	 *
	 * @param artist - The raw artist object from the API.
	 * @returns A sanitized Artist object.
	 */
	private sanitizeArtist(artist: any): Artist {
		return {
			id: DataValidator.sanitizeString(artist.id),
			label: DataValidator.sanitizeString(artist.label, 'Unknown artist')
		};
	}
}

/**
 * Factory function for creating an ArtistService instance.
 *
 * Provides a default configuration with the local API base URL.
 *
 * @returns A new ArtistService instance ready for use.
 */
export function createArtistService(): ArtistService {
	const apiService = new ApiService<Artist>({
		baseUrl: 'http://localhost:8080'
	});
	
	return new ArtistService(apiService);
}
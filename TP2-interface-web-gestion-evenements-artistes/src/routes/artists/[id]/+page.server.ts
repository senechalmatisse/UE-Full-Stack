import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createArtistService } from '$lib/services/artist.service';
import { AppError } from '$lib/services/api.error';

/** Singleton instance of ArtistService used for fetching artist data. */
const artistService = createArtistService();

/**
 * Page server load function for retrieving artist details and related events in SvelteKit.
 * 
 * Responsibilities:
 * - Fetches the artist record from the API using `ArtistService.getById`.
 * - Retrieves all events associated with the given artist using `ArtistService.getArtistEvents`.
 * - Provides both the artist details and events to the SvelteKit page.
 * 
 * Error handling strategy:
 * - Throws a `404 Not Found` error if the artist does not exist.
 * - Throws a `4xx` error if the request to the artist service is invalid.
 * - Throws a `503 Service Unavailable` error if the artist service cannot be reached.
 * - Falls back to a generic `500 Internal Server Error` for unexpected failures.
 * 
 * @function load
 * @type {PageServerLoad}
 * 
 * @param {object} options - Parameters provided by SvelteKit.
 * @param {object} options.params - URL parameters.
 * @param {string} options.params.id - Unique identifier of the artist.
 * 
 * @returns {Promise<{ artist: unknown; events: unknown[] }>}
 * A promise resolving to an object containing artist details and associated events.
 * 
 * @throws {AppError} 404 if the artist is not found.
 * @throws {AppError} 503 if the artist service is unavailable.
 * @throws {AppError} 500 for unexpected server errors.
 */
export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	try {
		const artist = await artistService.getById('/artists', id);
		if (!artist) {
			throw new AppError(404, 'Artiste introuvable');
		}

		const events = await artistService.getArtistEvents(id);

		return { artist, events };
	} catch (err) {
		if (err instanceof AppError) {
			if (err.code === 404) {
				throw error(404, 'Artiste introuvable');
			}
			if (err.code >= 400 && err.code < 500) {
				throw error(err.code, 'Requête invalide vers le service artiste');
			}
			throw error(503, 'Le service artiste est indisponible');
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw new AppError(500, 'Une erreur interne est survenue');
	}
};
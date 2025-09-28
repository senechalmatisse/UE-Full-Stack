import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createArtistService } from '$lib/services/artist.service';
import { AppError } from '$lib/services/api.error';

/** Singleton instance of ArtistService used for fetching artist data. */
const artistService = createArtistService();

/**
 * SvelteKit page server load function for retrieving a single artist by ID.
 *
 * - Fetches the artist details and its events from the API.
 * - Throws a 404 error if the artist does not exist.
 * - Throws a 503 error if the server is unavailable.
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

		// Cas inattendu : on logge mais on masque le détail côté client
		console.error('Unexpected error in load(artist):', err);
		throw new AppError(500, 'Une erreur interne est survenue');
	}
};
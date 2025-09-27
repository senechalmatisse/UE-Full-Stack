import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createEventService } from '$lib/services/event.service';
import { AppError } from '$lib/services/api.error';

/** Singleton instance of EventService used for fetching event data. */
const eventService = createEventService();

/**
 * SvelteKit page server load function for retrieving a single event by ID.
 *
 * - Fetches the event details from the API using `EventService`.
 * - Throws a 404 error if the event does not exist.
 * - Throws a 500 error if the server fails to fetch event data.
 *
 * @param params - URL parameters object provided by SvelteKit, containing the event ID.
 * @returns An object containing the `event` data for the page component.
 * @throws {Error} 404 if event not found, 500 if an unexpected server error occurs.
 */
export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

	try {
		const event = await eventService.getById('/events', id);

		if (!event) {
            throw new AppError(404, 'Événement introuvable');
		}

		return { event };
	} catch (err) {
		if (err instanceof AppError) {
			if (err.code >= 400 && err.code < 500) {
				throw new AppError(err.code, 'Requête invalide vers le service événements');
			}
			// Pour tout autre code AppError → indisponibilité du service
			throw new AppError(503, 'Le service événements est indisponible');
		}

		// Si c’est déjà une `HttpError` de SvelteKit → on la relance
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		// Erreur inattendue : log interne + message générique
		console.error('Unexpected error in load(event):', err);
		throw error(500, 'Une erreur interne est survenue');
	}
};
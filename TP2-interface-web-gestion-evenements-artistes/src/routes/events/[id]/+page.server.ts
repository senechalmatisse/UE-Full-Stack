import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AppError, createEventService } from '$lib/core';

/** Singleton instance of EventService used for fetching event data. */
const eventService = createEventService();

/**
 * Page server load function for retrieving event details by ID in SvelteKit.
 * Responsibilities:
 * - Delegates the event lookup to the `EventService` API client.
 * - Validates if the event exists, otherwise throws a `404 Not Found`.
 * - Normalizes error handling by distinguishing between client, server, and
 * unexpected errors.
 * 
 * Error handling strategy:
 * - Throws `AppError(404)` when the event is not found.
 * - Converts API client errors into meaningful HTTP errors:
 *   - `4xx` range: invalid requests to the event service.
 *   - `5xx` range: upstream event service is unavailable.
 * - Falls back to a generic `500 Internal Server Error` when no structured
 *   error is provided.
 * 
 * @function load
 * @type {PageServerLoad}
 * 
 * @param {object} options - Parameters provided by SvelteKit.
 * @param {object} options.params - URL parameters.
 * @param {string} options.params.id - Unique identifier of the event.
 * 
 * @returns {Promise<{ event: unknown }>} A promise resolving to an object containing event data.
 * 
 * @throws {AppError} Will throw a 404 error if the event is not found.
 * @throws {AppError} Will throw a 503 error if the event service is unavailable.
 * @throws {Error} Will throw a 500 error for unexpected server errors.
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

            throw new AppError(503, 'Le service événements est indisponible');
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Une erreur interne est survenue');
	}
};
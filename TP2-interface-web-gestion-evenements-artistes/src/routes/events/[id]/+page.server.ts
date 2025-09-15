import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createEventService } from '../../../lib/services/event.service';

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
        const event = await eventService.getEventById(id);

        if (!event) {
            throw error(404, 'Événement introuvable');
        }

        return { event };
    } catch (err) {
        throw error(500, 'Impossible de charger les détails de l’événement');
    }
};
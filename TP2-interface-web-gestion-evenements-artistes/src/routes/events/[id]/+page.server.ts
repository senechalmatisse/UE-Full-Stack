import type { PageServerLoad } from './$types';
import { createEventService } from '../../../lib/services/event.service';
import { error } from '@sveltejs/kit';

const eventService = createEventService();

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    try {
        const event = await eventService.getEventById(id);

        if (!event) {
            throw error(404, 'Événement introuvable');
        }

        return { event };
    } catch (err) {
        console.error('Erreur chargement event:', err);
        throw error(500, 'Impossible de charger les détails de l’événement');
    }
};
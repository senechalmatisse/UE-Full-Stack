import type { PageServerLoad } from './$types';

/**
 * Load function pour la page de création d'événement
 * Retourne simplement le type d'entité pour le typage
 */
export const load: PageServerLoad = async () => {
	return {
		entityType: 'event' as const
	};
};
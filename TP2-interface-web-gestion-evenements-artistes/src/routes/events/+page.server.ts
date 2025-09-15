import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PaginationValidator, DataValidator } from '../../lib/utils/validation';
import { createEventService } from '../../lib/services/event.service';
import type { Event, PaginationState } from '../../lib/types/pagination';

/**
 * Controller for the Events page.
 * Encapsulates pagination handling, data fetching, and transformation for the view.
 * Follows the Single Responsibility Principle.
 */
class EventsPageController {
	private paginationValidator: PaginationValidator;
	private eventService: ReturnType<typeof createEventService>;

	constructor() {
		this.paginationValidator = new PaginationValidator(1, 50);
		this.eventService = createEventService();
	}

	/**
	 * Loads page data including paginated events and pagination state.
     *
	 * @param url - Current page URL containing query parameters
	 * @returns Object containing events array and pagination state
	 */
	async loadPageData(url: URL): Promise<{ events: Event[] } & PaginationState> {
		const { page, size } = this.validateParams(url);
		const apiPage = this.paginationValidator.toApiPage(page);

		let response;
		try {
			response = await this.eventService.getEvents({ page: apiPage, size });

			// Vérification que la réponse est bien conforme
			if (!response || !Array.isArray(response.content)) {
				return this.buildEmptyState(page, size, 'Réponse invalide du serveur pour les événements');
			}

			// Vérification cohérence pagination
			if (page > response.totalPages && response.totalPages > 0) {
				return this.buildEmptyState(page, size, `Page ${page} introuvable. Il n’y a que ${response.totalPages} page(s) d’événements.`);
			}

			// Tout est OK → transformer pour la vue
			return this.transformForView(response);
		} catch (err) {
			// Erreur API → renvoyer un objet vide avec message d'erreur
			const message =
				err instanceof Error
					? err.message
					: 'Impossible de charger les événements depuis le serveur';

			return this.buildEmptyState(page, size, message);
		}
    }

	/**
	 * Validates URL query parameters for pagination.
     *
	 * @param url - Current page URL
	 * @returns Validated and sanitized pagination parameters
	 */
	private validateParams(url: URL) {
		const pageParam = url.searchParams.get('page');
		const sizeParam = url.searchParams.get('size');
		
		return this.paginationValidator.validate(pageParam, sizeParam);
	}

	/**
	 * Transforms API response into the structure expected by the view.
     *
	 * @param response - Raw paginated response from the API
	 * @returns Object containing events and pagination state
	 */
	private transformForView(response: any) {
		return {
			events: response.content,
			page: this.paginationValidator.fromApiPage(response.number),
			totalPages: DataValidator.sanitizeNumber(response.totalPages, 1),
			first: DataValidator.sanitizeBoolean(response.first),
			last: DataValidator.sanitizeBoolean(response.last),
			totalElements: DataValidator.sanitizeNumber(response.totalElements, 0),
			size: DataValidator.sanitizeNumber(response.size, 4)
		};
	}

    private buildEmptyState(page: number, size: number, errorMessage: string) {
		return {
			events: [],
			page,
			size,
			totalPages: 1,
			first: true,
			last: true,
			totalElements: 0,
			errorMessage
		} satisfies { events: Event[]; errorMessage: string } & PaginationState;
	}
}

// Singleton instance of the controller
const eventsController = new EventsPageController();

/**
 * SvelteKit page load function.
 * Delegates data fetching and transformation to the EventsPageController.
 */
export const load: PageServerLoad = async ({ url }) => {
	return await eventsController.loadPageData(url);
};
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
		
		const response = await this.eventService.getEvents({ page: apiPage, size });
		this.validatePageConsistency(page, response.totalPages);
		
		return this.transformForView(response);
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
	 * Ensures the requested page exists within total available pages.
	 * Throws a 404 error if requested page is out of bounds.
     *
	 * @param requestedPage - Page requested by the user
	 * @param totalPages - Total number of pages available
	 */
	private validatePageConsistency(requestedPage: number, totalPages: number): void {
		if (requestedPage > totalPages && totalPages > 0) {
			const plural = totalPages > 1 ? 's' : '';
			throw error(404, 
				`Page ${requestedPage} not found. There are only ${totalPages} page${plural} of events`
			);
		}
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
}

// Singleton instance of the controller
const eventsController = new EventsPageController();

/**
 * SvelteKit page load function.
 * Delegates data fetching and transformation to the EventsPageController.
 */
export const load: PageServerLoad = async ({ url }) => {
	try {
		return await eventsController.loadPageData(url);
	} catch (err) {
		// Re-throw errors handled by the controller
		throw err;
	}
};
import type { PageServerLoad } from './$types';
import { PaginationValidator, DataValidator } from '../../lib/utils/validation';
import { createEventService } from '../../lib/services/event.service';
import type { Event, PaginationState } from '../../lib/types/pagination';

/**
 * Controller class for the Events page.
 *
 * Encapsulates all logic related to fetching paginated events,
 * validating pagination parameters, and transforming API responses
 * into the format expected by the SvelteKit page.
 *
 * Follows the Single Responsibility Principle by isolating
 * server-side page logic from the UI.
 */
class EventsPageController {
	private paginationValidator: PaginationValidator;
	private eventService: ReturnType<typeof createEventService>;

	/**
	 * Initializes the controller with a PaginationValidator
	 * and an EventService instance.
	 */
	constructor() {
		this.paginationValidator = new PaginationValidator(1, 50);
		this.eventService = createEventService();
	}

	/**
	 * Loads paginated event data for the page.
	 *
	 * Handles query parameter validation, API calls, pagination checks,
	 * and transforms the response into the structure expected by the page.
	 *
	 * @param url - The current page URL containing query parameters
	 * @returns An object containing the events array and pagination state,
	 *          or an empty state with an error message if something fails.
	 */
	async loadPageData(url: URL): Promise<{ events: Event[] } & PaginationState> {
		const { page, size } = this.validateParams(url);
		const apiPage = this.paginationValidator.toApiPage(page);

		try {
			const response = await this.eventService.getEvents({ page: apiPage, size });

			// Validate that the response structure is correct
			if (!response || !Array.isArray(response.content)) {
				return this.buildEmptyState(page, size, 'Invalid server response for events.');
			}

			// Check pagination consistency
			if (page > response.totalPages && response.totalPages > 0) {
				return this.buildEmptyState(
					page,
					size,
					`Page ${page} not found. Only ${response.totalPages} page(s) of events exist.`
				);
			}

			// Transform API response into view model
			return this.transformForView(response);
		} catch (err) {
			// Handle API errors gracefully
			const message = err instanceof Error ? err.message : 'Failed to load events from the server.';
			return this.buildEmptyState(page, size, message);
		}
	}

	/**
	 * Validates URL query parameters for pagination.
	 *
	 * @param url - The current page URL
	 * @returns Validated page and size numbers
	 */
	private validateParams(url: URL) {
		const pageParam = url.searchParams.get('page');
		const sizeParam = url.searchParams.get('size');

		return this.paginationValidator.validate(pageParam, sizeParam);
	}

	/**
	 * Transforms the API response into the shape expected by the Svelte page.
	 *
	 * @param response - The raw paginated API response
	 * @returns An object containing events array and pagination state
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

	/**
	 * Builds an empty page state in case of errors or invalid responses.
	 *
	 * @param page - The current page number
	 * @param size - The current page size
	 * @param errorMessage - A descriptive error message
	 * @returns An object representing an empty state for the page
	 */
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

// Singleton instance of the controller to avoid re-instantiation on each request
const eventsController = new EventsPageController();

/**
 * SvelteKit page server load function.
 *
 * Delegates data fetching and transformation to the EventsPageController.
 * This function is executed on the server for the `/events` route.
 */
export const load: PageServerLoad = async ({ url }) => {
	return await eventsController.loadPageData(url);
};
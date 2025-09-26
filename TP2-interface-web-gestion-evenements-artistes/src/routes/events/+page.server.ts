import type { PageServerLoad } from './$types';
import { createEventService } from '$lib/services/event.service';
import type { Event } from '$lib/types/pagination';
import { PaginatedPageController } from '$lib/controllers/paginated-page.controller';

// Controller instance for events
const eventsController = new PaginatedPageController<Event>('events', createEventService());

/**
 * SvelteKit `load` function for the Events page.
 */
export const load: PageServerLoad = async ({ url }) => {
	const result = await eventsController.loadPageData(url);
	return {
		...result,
		events: result.items
	};
};
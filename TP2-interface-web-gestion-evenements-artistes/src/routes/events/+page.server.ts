import type { PageServerLoad } from './$types';
import type { Event } from '$lib/core';
import { createEventService, PaginatedPageController } from '$lib/core';

// Controller instance for events
const eventsController = new PaginatedPageController<Event>('events', createEventService());

/**
 * SvelteKit `load` function for the Events page.
 */
export const load: PageServerLoad = async ({ url }) => {
	const result = await eventsController.loadPageData(url);

	return {
		...result,
		events: result.items,
        eventListTotal: result.totalElements
	};
};
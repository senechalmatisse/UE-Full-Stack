import type { PageServerLoad } from './$types';
import { createArtistService, PaginatedPageController } from '$lib/core';
import type { Artist } from '$lib/core';

// Controller instance for artists
const artistsController = new PaginatedPageController<Artist>('artists', createArtistService());

/**
 * SvelteKit `load` function for the Artists page.
 */
export const load: PageServerLoad = async ({ url }) => {
	const result = await artistsController.loadPageData(url, true);

	return {
		...result,
		artists: result.items,
		artistListTotal: result.totalElements
	};
};
import type { PageServerLoad } from './$types';
import { createArtistService } from '../../lib/services/artist.service';
import type { Artist } from '../../lib/types/pagination';
import { PaginatedPageController } from '../../lib/controllers/paginated-page.controller';

// Controller instance for artists
const artistsController = new PaginatedPageController<Artist>('artists', createArtistService());

/**
 * SvelteKit `load` function for the Artists page.
 */
export const load: PageServerLoad = async ({ url }) => {
	const result = await artistsController.loadPageData(url, true);
	return {
		...result,
		artists: result.items
	};
};
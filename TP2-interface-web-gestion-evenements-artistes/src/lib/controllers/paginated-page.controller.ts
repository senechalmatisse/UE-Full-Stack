import { PaginationValidator, DataValidator } from '../utils/validation';
import type { PaginationState } from '../types/pagination';

/**
 * Generic controller for handling paginated data in SvelteKit pages.
 *
 * @typeParam T - The entity type (e.g., Artist, Event).
 */
export class PaginatedPageController<T> {
	private paginationValidator: PaginationValidator;
	private service: { getAll: (endpoint: string, params: { page: number; size: number }) => Promise<any> };
	private endpoint: string;

	/**
	 * Creates a new paginated controller.
	 *
	 * @param endpoint - The API endpoint for the resource (e.g., "artists" or "events").
	 * @param service - The API service providing the `getAll` method.
	 * @param minSize - Minimum allowed page size (default: 1).
	 * @param maxSize - Maximum allowed page size (default: 50).
	 */
	constructor(
		endpoint: string,
		service: { getAll: (endpoint: string, params: { page: number; size: number }) => Promise<any> },
		minSize = 1,
		maxSize = 50
	) {
		this.paginationValidator = new PaginationValidator(minSize, maxSize);
		this.service = service;
		this.endpoint = endpoint;
	}

	/**
	 * Loads paginated data for the given request URL.
	 *
	 * @param url - The request URL containing query parameters.
	 * @param withSearch - Whether to extract a search term (default: false).
	 * @returns The formatted data with pagination state.
	 */
	async loadPageData(
		url: URL,
		withSearch = false
	): Promise<{ items: T[]; searchTerm?: string } & PaginationState> {
		const { page, size } = this.extractPaginationParams(url);
		const apiPage = this.paginationValidator.toApiPage(page);

		const searchTerm = withSearch ? url.searchParams.get('search') ?? '' : undefined;

		try {
			const response = await this.service.getAll(this.endpoint, { page: apiPage, size });

			// Validate API structure
			if (!response || !Array.isArray(response.content)) {
				return this.buildEmptyPageState(page, size, `Invalid server response for ${this.endpoint}.`, searchTerm);
			}

			// If requested page is out of range, fallback to last valid page
			if (page > response.totalPages && response.totalPages > 0) {
				const lastValidPage = response.totalPages;
				const lastResponse = await this.service.getAll(this.endpoint, {
					page: this.paginationValidator.toApiPage(lastValidPage),
					size
				});
				return { ...this.mapApiResponseToView(lastResponse), searchTerm };
			}

			return { ...this.mapApiResponseToView(response), searchTerm };
		} catch (err) {
			const message =
				err instanceof Error ? err.message : `Failed to load ${this.endpoint} from the server.`;
			return this.buildEmptyPageState(page, size, message, searchTerm);
		}
	}

	/** Extracts and validates pagination params from URL. */
	private extractPaginationParams(url: URL) {
		const pageParam = url.searchParams.get('page');
		const sizeParam = url.searchParams.get('size');
		return this.paginationValidator.validate(pageParam, sizeParam ?? '10');
	}

	/** Maps API response to view model. */
	private mapApiResponseToView(response: any) {
		return {
			items: response.content as T[],
			page: this.paginationValidator.fromApiPage(response.number),
			totalPages: DataValidator.sanitizeNumber(response.totalPages, 1),
			first: DataValidator.sanitizeBoolean(response.first),
			last: DataValidator.sanitizeBoolean(response.last),
			totalElements: DataValidator.sanitizeNumber(response.totalElements, 0),
			size: DataValidator.sanitizeNumber(response.size, 4)
		};
	}

	/** Builds an empty page state in case of error. */
	private buildEmptyPageState(page: number, size: number, errorMessage: string, searchTerm?: string) {
		return {
			items: [] as T[],
			page,
			size,
			totalPages: 1,
			first: true,
			last: true,
			totalElements: 0,
			errorMessage,
			searchTerm
		} satisfies { items: T[]; searchTerm?: string; errorMessage: string } & PaginationState;
	}
}
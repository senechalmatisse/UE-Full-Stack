import {
    getPaginationValidator,
    getDataValidator
} from '$lib/utils/validation/factories';
import type {
    PaginationState,
    PaginatedResponse,
    PaginationParams
} from '$lib/types/pagination';
import { AppError } from '$lib/services/api.error';
import { getAppConfig } from '$lib/config';

/**
 * Generic controller for handling paginated data in SvelteKit pages.
 *
 * Provides a reusable abstraction to:
 * - Extract and validate pagination parameters from the request URL.
 * - Query an API service for paginated data.
 * - Map API responses into a standardized view model.
 * - Gracefully handle out-of-range pages and errors by returning a safe state.
 *
 * @typeParam T - The entity type contained in the paginated response (e.g., `Artist`, `Event`).
 *
 * @example
 * ```ts
 * const controller = new PaginatedPageController<Artist>("artists", artistService);
 *
 * export async function load({ url }) {
 *   return await controller.loadPageData(url, true);
 * }
 * ```
 */
export class PaginatedPageController<T> {
	private paginationValidator: ReturnType<typeof getPaginationValidator>;
	private dataValidator: ReturnType<typeof getDataValidator>;
    private service: {
		getAll: (endpoint: string, params: PaginationParams) => Promise<PaginatedResponse<T>>;
	};
	private endpoint: string;

	/**
	 * Creates a new `PaginatedPageController` instance.
	 *
	 * @param endpoint - The API endpoint for the resource (e.g., `"artists"` or `"events"`).
	 * @param service - The API service providing the `getAll` method for retrieving paginated data.
	 */
	constructor(
        endpoint: string,
        service: { getAll: (endpoint: string, params: PaginationParams) => Promise<PaginatedResponse<T>> }
    ) {
		this.service = service;
		this.endpoint = endpoint;
		this.paginationValidator = getPaginationValidator();
		this.dataValidator = getDataValidator();
	}

	/**
	 * Loads paginated data from the API for a given request URL.
	 *
	 * - Extracts `page` and `size` parameters from the URL.
	 * - Calls the API service to retrieve the corresponding data.
	 * - Optionally extracts a `search` query parameter when `withSearch` is enabled.
	 * - Falls back to the last available page if the requested one is out of range.
	 * - Returns an empty state with an error message if the request fails.
	 *
	 * @param url - The request URL containing query parameters (`page`, `size`, `search`).
	 * @param withSearch - Whether to extract a search term from the query string (default: `false`).
	 * @returns A promise resolving to an object containing:
	 * - `items`: The list of entities for the current page.
	 * - `page`, `size`, `totalPages`, `first`, `last`, `totalElements`: Pagination metadata.
	 * - `searchTerm`: Optional search query (if `withSearch` is enabled).
	 * - `errorMessage`: Error message if the request fails.
	 */
	async loadPageData(
		url: URL,
		withSearch = false
	): Promise<{ items: T[]; searchTerm?: string; errorMessage?: string } & PaginationState> {
        const { page, size } = this.extractPaginationParams(url);
		const apiPage = this.paginationValidator.toApiPage(page);
		const searchTerm = withSearch ? url.searchParams.get('search') ?? '' : undefined;
		const APP_CONFIG = getAppConfig();

		try {
			const response = await this.service.getAll(
                this.endpoint,
                { page: apiPage, size, search: searchTerm }
            );
			const validated = this.validateApiResponse(response);

			// If requested page is out of range, fallback to last valid page
			if (page > validated.totalPages && validated.totalPages > 0) {
				const lastValidPage = validated.totalPages;
				const lastResponse = await this.service.getAll(this.endpoint, {
					page: this.paginationValidator.toApiPage(lastValidPage),
					size,
					search: searchTerm
				});
				return {
                    ...this.mapApiResponseToView(this.validateApiResponse(lastResponse)),
                    searchTerm
                };
			}

			return { ...this.mapApiResponseToView(validated), searchTerm };
		} catch (err) {
			const message =
				err instanceof AppError
					? err.message
					: APP_CONFIG.errors.messages.server;

			return this.buildEmptyPageState(page, size, message, searchTerm);
		}
	}

	/**
	 * Validates that the API response has the expected structure.
	 *
	 * @param response - The raw API response.
	 * @throws {Error} If the response does not contain the required fields.
	 * @returns The validated response object.
	 */
	private validateApiResponse(response: any) {
		if (!response ||
			!Array.isArray(response.content) ||
			typeof response.number !== 'number'
		) {
			throw new AppError(500, `Réponse invalide du serveur pour ${this.endpoint}`);
		}
		return response;
	}

	/**
	 * Extracts and validates pagination parameters (`page` and `size`) from a URL.
	 *
	 * @param url - The request URL containing query parameters.
	 * @returns A validated `{ page, size }` object.
	 */
	private extractPaginationParams(url: URL) {
		const pageParam = url.searchParams.get('page');
		const sizeParam = url.searchParams.get('size');
		return this.paginationValidator.validate(pageParam, sizeParam ?? '10');
	}

	/**
	 * Maps a valid API response to the view model expected by SvelteKit pages.
	 *
	 * Ensures pagination fields are properly sanitized using {@link DataValidator}.
	 *
	 * @param response - The validated API response.
	 * @returns A formatted object with items and pagination metadata.
	 */
	private mapApiResponseToView(response: any) {
		return {
			items: response.content as T[],
			page: this.paginationValidator.fromApiPage(response.number),
			totalPages: this.dataValidator.sanitizeNumber(response.totalPages, 1),
			first: this.dataValidator.sanitizeBoolean(response.first),
			last: this.dataValidator.sanitizeBoolean(response.last),
			totalElements: this.dataValidator.sanitizeNumber(response.totalElements, 0),
			size: this.dataValidator.sanitizeNumber(response.size, 10)
		};
	}

	/**
	 * Builds a safe fallback page state in case of API failure.
	 *
	 * - Returns an empty list of items.
	 * - Resets pagination metadata to default values.
	 * - Includes the provided error message.
	 *
	 * @param page - The requested page number.
	 * @param size - The requested page size.
	 * @param errorMessage - The error message to display.
	 * @param searchTerm - Optional search term.
	 * @returns A fallback pagination state object.
	 */
	private buildEmptyPageState(
        page: number,
        size: number,
        errorMessage: string,
        searchTerm?: string
    ) {
		const APP_CONFIG = getAppConfig();

		return {
			items: [] as T[],
			page,
			size,
            totalPages: APP_CONFIG.pagination.minSize,
			first: true,
			last: true,
			totalElements: 0,
			errorMessage,
			searchTerm
		};
	}
}
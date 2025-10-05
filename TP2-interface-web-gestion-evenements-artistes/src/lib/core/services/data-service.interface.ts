import type { PaginatedResponse, PaginationParams } from "../pagination";

/**
 * Generic interface for services that fetch data from an API.
 *
 * @template T The type of entity managed by the service.
 */
export interface IDataService<T> {
	/**
	 * Fetches a paginated set of resources from the given API endpoint.
	 *
	 * @param endpoint - The API endpoint to fetch from.
	 * @param params - Pagination parameters including page, size, and optional search term.
	 * @returns A promise resolving to a paginated response of type `T`.
	 */
	fetchPaginated(
        endpoint: string,
        params: PaginationParams
    ): Promise<PaginatedResponse<T>>;
}
import type {
    PaginatedResponse,
    PaginationParams,
    PaginationState
} from './pagination.types';
import type { IPaginationValidator, IDataValidator } from '../validation';
import { AppError } from '../services';
import { getAppConfig } from '../config';
import { getDataValidator, getPaginationValidator } from '../validation';

/**
 * @displayName PaginatedPageController
 * @public
 *
 * Generic controller for managing paginated data in SvelteKit pages.
 *
 * Handles pagination logic consistently across multiple views by:
 * - Extracting and validating query parameters.
 * - Fetching data from an API service.
 * - Validating and mapping API responses to a normalized format.
 * - Gracefully handling errors and invalid page requests.
 *
 * @template T - The type of entity contained in the paginated response (e.g., `Artist`, `Event`).
 */
export class PaginatedPageController<T> {
    private paginationValidator: IPaginationValidator;
    private dataValidator: IDataValidator;
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
     * Loads paginated data from the API based on a given request URL.
     *
     * Supports search queries, automatic fallback to last valid page,
     * and safe error handling for network or server issues.
     *
     * @param url - The request URL containing pagination parameters.
     * @param withSearch - Whether to extract the `search` query parameter (default: `false`).
     * @returns A paginated state object containing items, pagination info, and optional errors.
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
import type { PaginatedResponse, PaginationParams } from '$lib/types/pagination';
import { ApiService } from './api.service';
import { getSanitizer } from '$lib/utils/sanitizer/sanitizer.factory';
import { getAppConfig } from '$lib/config';
import { AppError } from './api.error';

/**
 * Abstract base service providing standard CRUD operations for entities.
 *
 * This class serves as a foundation for domain-specific services
 * (e.g., `EventService`, `ArtistService`), ensuring consistent
 * data fetching, creation, updating, and deletion patterns.
 *
 * Includes automatic sanitization of entities and paginated responses.
 *
 * @template T - The type of entity managed by the service.
 */
export abstract class BaseService<T> {
	protected apiService: ApiService<T>;
    protected sanitizer = getSanitizer();

	/**
	 * Creates a new BaseService instance.
	 *
	 * @param apiService - The ApiService instance used to perform HTTP requests.
	 */
	constructor(apiService: ApiService<T>) {
		this.apiService = apiService;
	}

	/**
	 * Fetch a paginated list of entities.
	 *
	 * @param endpoint - The API endpoint (relative to the base URL).
	 * @param params - Pagination parameters (page, size, optional search).
	 * @returns A `PaginatedResponse` containing sanitized entities of type T.
	 *
	 * @throws {Error} If the request fails or returns invalid data.
	 */
	public async getAll(
        endpoint: string,
        params: PaginationParams
    ): Promise<PaginatedResponse<T>> {
		try {
			const response = await this.apiService.fetchPaginated(endpoint, params);
			return this.sanitizer.paginated(response, (item) => this.sanitize(item));
		} catch (err) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Fetch a single entity by its ID.
	 *
	 * @param endpoint - The API endpoint.
	 * @param id - The entity's unique identifier.
	 * @returns The sanitized entity if found, otherwise `null`.
	 *
	 * @throws {Error} If the request fails.
	 */
	public async getById(endpoint: string, id: string): Promise<T | null> {
		try {
			const entity = await this.apiService.request<T>(`${endpoint}/${id}`);
			return entity ? this.sanitize(entity) : null;
		} catch (err) {
			this.handleError(err, 'notFound');
		}
	}

	/**
	 * Create a new entity.
	 *
	 * @param endpoint - The API endpoint.
	 * @param payload - The entity payload, excluding its ID.
	 * @returns The newly created sanitized entity, or `null` if creation failed.
	 *
	 * @throws {Error} If the request fails.
	 */
	public async create(
        endpoint: string,
        payload: Omit<T, 'id'>
    ): Promise<T | null> {
		try {
			const created = await this.apiService.request<T>(
				endpoint,
				this.apiService['withJsonBody'](payload, 'POST')
			);
			return created ? this.sanitize(created) : null;
		} catch (err) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Update an existing entity by ID.
	 *
	 * @param endpoint - The API endpoint.
	 * @param id - The entity's unique identifier.
	 * @param payload - Partial payload containing only the fields to update.
	 * @returns The updated sanitized entity, or `null` if the entity does not exist.
	 *
	 * @throws {Error} If the request fails.
	 */
	public async update(
        endpoint: string,
        id: string,
        payload: Partial<T>
    ): Promise<T | null> {
		try {
			const updated = await this.apiService.request<T>(
				`${endpoint}/${id}`,
                this.apiService.withJsonBody(payload, 'PUT')
			);
			return updated ? this.sanitize(updated) : null;
		} catch (err) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Delete an entity by ID.
	 *
	 * @param endpoint - The API endpoint.
	 * @param id - The entity's unique identifier.
	 * @returns `true` if the deletion succeeded.
	 *
	 * @throws {Error} If the request fails.
	 */
	public async delete(
        endpoint: string,
        id: string
    ): Promise<boolean> {
		try {
			await this.apiService.request<void>(
                `${endpoint}/${id}`, { method: 'DELETE' }
            );
			return true;
		} catch (err) {
			this.handleError(err, 'generic');
		}
	}

	/**
	 * Sanitize a raw entity returned by the API.
	 *
	 * Must be implemented by subclasses to enforce domain-specific
	 * validation, transformation, or cleaning of data.
	 *
	 * @param data - The raw entity data returned by the API.
	 * @returns The sanitized entity of type T.
	 */
	protected abstract sanitize(data: any): T;

	/**
	 * Consistent error handling for all CRUD methods.
	 */
    protected handleError(
        err: unknown,
		fallbackKey: keyof ReturnType<typeof getAppConfig>['errors']['messages']
    ): never {
        if (err instanceof AppError) {
            throw err;
        }

		const APP_CONFIG = getAppConfig();
        const code = (err as any)?.status ?? 500;
        const key = APP_CONFIG.errors.map[code] ?? fallbackKey;
        const message = APP_CONFIG.errors.messages[key];

        throw new AppError(code, message);
    }
}
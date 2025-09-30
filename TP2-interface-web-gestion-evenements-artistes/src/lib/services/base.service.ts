import type { PaginatedResponse, PaginationParams } from '$lib/types/pagination';
import { ApiService } from './api.service';
import { Sanitizer } from '$lib/utils/sanitizer';

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
		const response = await this.apiService.fetchPaginated(endpoint, params);
		return Sanitizer.paginated(response, (item) => this.sanitize(item));
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
		const entity = await this.apiService.request<T>(`${endpoint}/${id}`);
		return entity ? this.sanitize(entity) : null;
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
		const created = await this.apiService.request<T>(
            endpoint,
            this.apiService['withJsonBody'](payload, 'POST')
        );
		return created ? this.sanitize(created) : null;
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
		const updated = await this.apiService.request<T>(
            `${endpoint}/${id}`,
            this.apiService['withJsonBody'](payload, 'PUT')
        );
		return updated ? this.sanitize(updated) : null;
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
		await this.apiService.request<void>(
            `${endpoint}/${id}`,
            { method: 'DELETE' }
        );
		return true;
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
}
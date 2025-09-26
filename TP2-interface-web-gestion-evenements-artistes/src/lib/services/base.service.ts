import type { PaginatedResponse, PaginationParams } from '../types/pagination';
import { ApiService } from './api.service';
import { Sanitizer } from '../utils/sanitizer';

/**
 * Base service providing common CRUD operations and error handling.
 *
 * Generic class extended by domain-specific services (EventService, ArtistService, etc.).
 */
export abstract class BaseService<T> {
	protected apiService: ApiService<T>;

	constructor(apiService: ApiService<T>) {
		this.apiService = apiService;
	}

	/**
	 * Fetch a paginated list of entities.
	 */
	async getAll(endpoint: string, params: PaginationParams): Promise<PaginatedResponse<T>> {
		const response = await this.apiService.fetchPaginated(endpoint, params);
		return Sanitizer.paginated(response, (item) => this.sanitize(item));
	}

	async getById(endpoint: string, id: string): Promise<T | null> {
		const entity = await this.apiService.request<T>(`${endpoint}/${id}`);
		return entity ? this.sanitize(entity) : null;
	}

	async create(endpoint: string, payload: Omit<T, 'id'>): Promise<T | null> {
		const created = await this.apiService.request<T>(endpoint, this.apiService['withJsonBody'](payload, 'POST'));
		return created ? this.sanitize(created) : null;
	}

	async update(endpoint: string, id: string, payload: Partial<T>): Promise<T | null> {
		const updated = await this.apiService.request<T>(`${endpoint}/${id}`, this.apiService['withJsonBody'](payload, 'PUT'));
		return updated ? this.sanitize(updated) : null;
	}

	async delete(endpoint: string, id: string): Promise<boolean> {
		await this.apiService.request<void>(`${endpoint}/${id}`, { method: 'DELETE' });
		return true;
	}

	protected abstract sanitize(data: any): T;
}
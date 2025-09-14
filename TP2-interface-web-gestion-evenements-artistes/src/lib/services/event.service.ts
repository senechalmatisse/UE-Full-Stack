import type { Event, Artist, PaginatedResponse, PaginationParams } from '../types/pagination';
import { DataValidator } from '../utils/validation';
import { ApiService } from './api.service';

/**
 * Specialized service for handling event-related data.
 *
 * Implements the Single Responsibility Principle by focusing only
 * on event-specific logic such as validation and sanitization.
 */
export class EventService {
	private apiService: ApiService<Event>;

	/**
	 * Creates a new EventService instance.
	 *
	 * @param apiService - The API service responsible for fetching event data.
	 */
	constructor(apiService: ApiService<Event>) {
		this.apiService = apiService;
	}

	/**
	 * Retrieves paginated events from the API.
	 *
	 * - Delegates fetching to the ApiService.
	 * - Sanitizes and validates the returned event data.
	 *
	 * @param params - Pagination parameters (page and size).
	 * @returns A promise resolving to a paginated response of sanitized events.
	 */
	async getEvents(params: PaginationParams): Promise<PaginatedResponse<Event>> {
		const response = await this.apiService.fetchPaginated('events', params);
		
		// Transform and validate the data
		return {
			...response,
			content: response.content.map(event => this.sanitizeEvent(event))
		};
	}

	async getEventById(id: string): Promise<Event> {
		const event = await this.apiService.request<Event>(`events/${id}`);
		return this.sanitizeEvent(event);
	}

	async updateEvent(id: string, payload: { label: string; startDate: string; endDate: string }): Promise<Event> {
		const event = await this.apiService.request<Event>(`events/${id}`, {
			method: 'PUT',
			body: JSON.stringify(payload)
		});
		return this.sanitizeEvent(event);
	}

	async deleteEvent(id: string): Promise<void> {
		await this.apiService.request<void>(`events/${id}`, { method: 'DELETE' });
	}

	async addArtistToEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, { method: 'POST' });
	}

	async removeArtistFromEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, { method: 'DELETE' });
	}

	/**
	 * Sanitizes and validates a single event object.
	 *
	 * Ensures that IDs, labels, and dates are safe strings,
	 * and that the artists list is valid.
	 *
	 * @param event - The raw event object from the API.
	 * @returns A sanitized Event object.
	 */
	private sanitizeEvent(event: any): Event {
		return {
			id: DataValidator.sanitizeString(event.id),
			label: DataValidator.sanitizeString(event.label, 'Untitled event'),
			startDate: DataValidator.sanitizeString(event.startDate),
			endDate: DataValidator.sanitizeString(event.endDate),
			artists: Array.isArray(event.artists) 
				? event.artists.map((artist: any) => this.sanitizeArtist(artist))
				: []
		};
	}

	/**
	 * Sanitizes and validates a single artist object.
	 *
	 * Ensures that IDs and labels are safe strings.
	 *
	 * @param artist - The raw artist object from the API.
	 * @returns A sanitized Artist object.
	 */
	private sanitizeArtist(artist: any): Artist {
		return {
			id: DataValidator.sanitizeString(artist.id),
			label: DataValidator.sanitizeString(artist.label, 'Unknown artist')
		};
	}
}

/**
 * Factory function for creating an EventService instance.
 *
 * Provides a default configuration with the local API base URL.
 *
 * @returns A new EventService instance ready for use.
 */
export function createEventService(): EventService {
	const apiService = new ApiService<Event>({
		baseUrl: 'http://localhost:8080'
	});
	
	return new EventService(apiService);
}
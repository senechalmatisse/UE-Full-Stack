import type { Event, Artist, PaginatedResponse, PaginationParams } from '../types/pagination';
import { DataValidator } from '../utils/validation';
import { ApiService } from './api.service';

/**
 * Service responsible for handling all operations related to events.
 *
 * This class encapsulates all API interactions for events, including:
 * - Fetching paginated events
 * - Retrieving a single event by ID
 * - Updating and deleting events
 * - Adding or removing artists from events
 *
 * It ensures that all data returned from the API is sanitized and validated.
 */
export class EventService {
	private apiService: ApiService<Event>;

	/**
	 * Creates a new EventService instance.
	 *
	 * @param apiService - An instance of ApiService configured for Event objects.
	 */
	constructor(apiService: ApiService<Event>) {
		this.apiService = apiService;
	}

	/**
	 * Fetches paginated events from the API.
	 *
	 * This method delegates the API call to the underlying ApiService,
	 * then sanitizes each event in the response.
	 *
	 * @param params - Pagination parameters (page number and page size).
	 * @returns A Promise resolving to a PaginatedResponse containing sanitized Event objects.
	 */
	async getEvents(params: PaginationParams): Promise<PaginatedResponse<Event>> {
		const response = await this.apiService.fetchPaginated('events', params);
		return {
			...response,
			content: response.content.map(event => this.sanitizeEvent(event))
		};
	}

	/**
	 * Retrieves a single event by its unique identifier.
	 *
	 * @param id - The ID of the event to fetch.
	 * @returns A Promise resolving to a sanitized Event object.
	 */
	async getEventById(id: string): Promise<Event> {
		const event = await this.apiService.request<Event>(`events/${id}`);
		return this.sanitizeEvent(event);
	}

	/**
	 * Updates an existing event with new data.
	 *
	 * @param id - The ID of the event to update.
	 * @param payload - Object containing the updated event data:
	 *                  - label: New label for the event
	 *                  - startDate: New start date
	 *                  - endDate: New end date
	 * @returns A Promise resolving to the updated and sanitized Event object.
	 */
	async updateEvent(id: string, payload: { label: string; startDate: string; endDate: string }): Promise<Event> {
		const event = await this.apiService.request<Event>(`events/${id}`, {
			method: 'PUT',
			body: JSON.stringify(payload)
		});
		return this.sanitizeEvent(event);
	}

	/**
	 * Deletes an event by its ID.
	 *
	 * @param id - The ID of the event to delete.
	 * @returns A Promise that resolves when the deletion is complete.
	 */
	async deleteEvent(id: string): Promise<void> {
		await this.apiService.request<void>(`events/${id}`, {
            method: 'DELETE'
        });
	}

    /**
	 * Associates an artist with a specific event.
	 *
	 * @param eventId - The ID of the event.
	 * @param artistId - The ID of the artist to add.
	 * @returns A Promise that resolves when the artist is successfully added.
	 */
	async addArtistToEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, {
            method: 'POST'
        });
	}

	/**
	 * Removes an artist from a specific event.
	 *
	 * @param eventId - The ID of the event.
	 * @param artistId - The ID of the artist to remove.
	 * @returns A Promise that resolves when the artist is successfully removed.
	 */
	async removeArtistFromEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, {
            method: 'DELETE'
        });
	}

	/**
	 * Sanitizes and validates an event object returned from the API.
	 *
	 * Ensures that IDs, labels, dates, and associated artists are valid and safe.
	 *
	 * @param event - Raw event object from the API.
	 * @returns A sanitized Event object.
	 */
	private sanitizeEvent(event: any): Event {
		return {
			id: DataValidator.sanitizeString(event.id),
			label: DataValidator.sanitizeString(event.label, 'Événement sans titre'),
			startDate: DataValidator.sanitizeString(event.startDate),
			endDate: DataValidator.sanitizeString(event.endDate),
			artists: Array.isArray(event.artists) 
				? event.artists.map((artist: any) => this.sanitizeArtist(artist))
				: []
		};
	}

	/**
	 * Sanitizes and validates an artist object associated with an event.
	 *
	 * @param artist - Raw artist object from the API.
	 * @returns A sanitized Artist object.
	 */
	private sanitizeArtist(artist: any): Artist {
		return {
			id: DataValidator.sanitizeString(artist.id),
			label: DataValidator.sanitizeString(artist.label, 'Artiste inconnue')
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
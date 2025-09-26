import type { Event } from '../types/pagination';
import { Sanitizer } from '../utils/sanitizer';
import { BaseService } from './base.service';
import { ApiServiceFactory } from './api.service';

export class EventService extends BaseService<Event> {
	constructor() {
		super(ApiServiceFactory.create<Event>('event'));
	}

	/** Associer un artiste à un événement */
	async addArtistToEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, { method: 'POST' });
	}

	/** Retirer un artiste d’un événement */
	async removeArtistFromEvent(eventId: string, artistId: string): Promise<void> {
		await this.apiService.request<void>(`events/${eventId}/artists/${artistId}`, { method: 'DELETE' });
	}

	/** Implémentation spécifique du sanitize */
	protected sanitize(raw: any): Event {
		return Sanitizer.event(raw);
	}
}

export function createEventService(): EventService {
	return new EventService();
}
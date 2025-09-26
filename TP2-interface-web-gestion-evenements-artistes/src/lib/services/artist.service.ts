import type { Artist, Event } from '../types/pagination';
import { Sanitizer } from '../utils/sanitizer';
import { ApiServiceFactory } from './api.service';
import { BaseService } from './base.service';

export class ArtistService extends BaseService<Artist> {
	constructor() {
		super(ApiServiceFactory.create<Artist>('artist'));
	}

	/** Récupère tous les événements liés à un artiste */
	async getArtistEvents(id: string): Promise<Event[]> {
		const events = await this.apiService.request<Event[]>(`artists/${id}/events`);
		return (events ?? []).map(Sanitizer.event);
	}

	/** Implémentation spécifique du sanitize */
	protected sanitize(raw: any): Artist {
		return Sanitizer.artist(raw);
	}
}

export function createArtistService(): ArtistService {
	return new ArtistService();
}
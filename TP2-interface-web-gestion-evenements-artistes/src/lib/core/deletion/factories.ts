import type { Artist, Event, ArtistService, EventService } from '$lib/core';
import type { EntityDeletionConfig } from './types';

/**
 * Factory for creating pre-configured {@link EntityDeletionConfig} instances.
 * 
 * Provides convenient, type-safe factory methods for common entity types,
 * eliminating boilerplate and ensuring consistent configuration across
 * the application.
 */
export class EntityDeletionConfigFactory {

    /**
     * Creates a deletion configuration for an Event entity.
     * 
     * Automatically configures:
     * - Entity name and type
     * - API endpoint
     * - Service delegation to {@link EventService.delete}
     * - Redirect route to events list
     * - Association warnings for linked artists
     * 
     * @param eventId - Unique identifier of the event to delete.
     * @param eventService - Instance of {@link EventService} for deletion.
     * @param artistsCount - Number of artists associated with this event.
     * @returns A fully configured {@link EntityDeletionConfig} for the event.
     */
    static createEventDeletionConfig(
        eventId: string,
        eventService: EventService,
        artistsCount: number = 0
    ): EntityDeletionConfig<Event> {
        const config: EntityDeletionConfig<Event> = {
            entityName: 'événement',
            entityId: eventId,
            endpoint: '/events',
            deleteService: (endpoint, id) => eventService.delete(endpoint, id),
            redirectRoute: '/events'
        };

        // Add association warning if there are linked artists
        if (artistsCount > 0) {
            config.associations = {
                count: artistsCount,
                type: 'artiste(s)',
                warningMessage: `Cet événement est lié à ${artistsCount} artiste(s).`
            };
        }

        return config;
    }

    /**
     * Creates a deletion configuration for an Artist entity.
     * 
     * Automatically configures:
     * - Entity name and type
     * - API endpoint
     * - Service delegation to {@link ArtistService.delete}
     * - Redirect route to artists list
     * - Association warnings for linked events
     * 
     * @param artistId - Unique identifier of the artist to delete.
     * @param artistService - Instance of {@link ArtistService} for deletion.
     * @param eventsCount - Number of events associated with this artist.
     * @returns A fully configured {@link EntityDeletionConfig} for the artist.
     */
    static createArtistDeletionConfig(
        artistId: string,
        artistService: ArtistService,
        eventsCount: number = 0
    ): EntityDeletionConfig<Artist> {
        const config: EntityDeletionConfig<Artist> = {
            entityName: 'artiste',
            entityId: artistId,
            endpoint: '/artists',
            deleteService: (endpoint, id) => artistService.delete(endpoint, id),
            redirectRoute: '/artists'
        };

        // Add association warning if there are linked events
        if (eventsCount > 0) {
            config.associations = {
                count: eventsCount,
                type: 'événement(s)',
                warningMessage: `Cet artiste est lié à ${eventsCount} événement(s).`
            };
        }

        return config;
    }
}
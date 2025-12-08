import type { Artist, Event } from '../domain';
import type { ArtistService, EventService } from '../services';
import { EntityCreationConfigBuilder } from './builders';
import type { IEntityCreationConfig } from './types';

/**
 * Factory pour créer les configurations des entités
 */
export class EntityConfigFactory {
    /**
     * Configuration pour la création d'artiste
     */
    static createArtistConfig(
        artistService: ArtistService
    ): IEntityCreationConfig<Artist> {
        return new EntityCreationConfigBuilder<Artist>()
            .setEntityName('artiste', 'artistes')
            .setListRoute('/artists')
            .setCreateService((payload) => artistService.create('/artists', payload))
            .addTextField('label', 'Nom de l\'artiste', {
                placeholder: 'Ex: The Rolling Stones',
                validation: (value) => {
                    if (!value || value.trim().length < 3) {
                        return 'Le nom doit contenir au moins 3 caractères';
                    }
                    if (value.length > 100) {
                        return 'Le nom ne peut pas dépasser 100 caractères';
                    }
                    return null;
                }
            })
            .build();
    }

    /**
     * Configuration pour la création d'événement
     */
    static createEventConfig(
        eventService: EventService
    ): IEntityCreationConfig<Omit<Event, 'artists'>> {
        return new EntityCreationConfigBuilder<Omit<Event, 'artists'>>()
            .setEntityName('événement', 'événements')
            .setListRoute('/events')
            .setCreateService((payload) => eventService.create('/events', payload))
            .addTextField('label', 'Nom de l\'événement', {
                placeholder: 'Ex: Festival Rock en Seine 2025',
                validation: (value) => {
                    if (!value || value.trim().length < 3) {
                        return 'Le nom doit contenir au moins 3 caractères';
                    }
                    return null;
                }
            })
            .addDateField('startDate', 'Date de début', {
                validation: (value) => {
                    if (!value) return 'La date de début est requise';
                    const date = new Date(value);
                    if (date < new Date()) {
                        return 'La date de début ne peut pas être dans le passé';
                    }
                    return null;
                }
            })
            .addDateField('endDate', 'Date de fin', {
                validation: (value) => {
                    if (!value) return 'La date de fin est requise';
                    return null;
                }
            })
            .build();
    }
}
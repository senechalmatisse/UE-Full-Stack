import { createEventDispatcher } from "svelte";
import { AppError, getDataValidator } from "$lib/core";
import type { Artist, Event } from "$lib/core";

type Entity = Artist | Event;

/**
 * Configuration options for {@link useEntityEditor}.
 *
 * @template T - The entity type being edited (e.g., {@link Artist} or {@link Event}).
 */
interface UseEntityEditorOptions<T extends Entity> {
    /** The entity instance being edited. */
    entity: T;

    /** Service providing an update method for persisting entity changes. */
    service: {
        /**
         * Updates an entity on the backend.
         * @param path - API endpoint path.
         * @param id - Entity identifier.
         * @param data - Updated entity data.
         */
        update: (path: string, id: string, data: any) => Promise<T | null>;
    };

    /** API endpoint for the entity. */
    endpoint: string;

    /** Minimum required length for the label (default: `3`). */
    minLabelLength?: number;
}

/**
 * Composable for managing entity editing logic in Svelte components.
 *
 * Centralizes common editing operations for domain entities (e.g., Artists, Events):
 * - Local validation of editable fields
 * - Sanitization of input values
 * - API integration for save/update
 * - Event dispatching for parent component updates
 *
 * @template T - The entity type being edited.
 *
 * @example
 * ```ts
 * const { saveEntity, validateLabel, dispatch } = useEntityEditor({
 *   entity: artist,
 *   service: artistService,
 *   endpoint: '/artists'
 * });
 *
 * await saveEntity({ label: 'New Artist Name' });
 * ```
 */
export function useEntityEditor<T extends Entity>({
    entity,
    service,
    endpoint,
    minLabelLength = 3
}: UseEntityEditorOptions<T>) {
    const dispatch = createEventDispatcher<{ updated: T }>();
    const validator = getDataValidator();

    /**
     * Validates the `label` field to ensure it meets length requirements.
     *
     * @param label - The label to validate.
     * @throws {AppError} If the label length is shorter than the allowed minimum.
     */
    function validateLabel(label: string): void {
        if (label.trim().length < minLabelLength) {
            throw new AppError(
                400,
                `Le nom doit contenir au moins ${minLabelLength} caractères`
            );
        }
    }

    /**
     * Saves the updated entity by validating, sanitizing, and dispatching the update.
     *
     * @param updates - Partial object containing fields to update.
     * @returns A promise resolving to the updated entity.
     * @throws {AppError} If validation fails or the update operation fails.
     */
    async function saveEntity(updates: Partial<T>): Promise<T> {
        // Validate label if present
        if (updates.label !== undefined) {
            validateLabel(updates.label);
        }

        // Sanitize string fields
        const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string'
                ? validator.sanitizeString(value)
                : value;
            return acc;
        }, {} as Record<string, any>);

        const updated = await service.update(endpoint, entity.id, sanitizedUpdates);

        if (!updated) {
            throw new AppError(500, "Échec lors de la mise à jour");
        }

        dispatch("updated", updated);
        return updated;
    }

    return {
        validateLabel,
        saveEntity,
        dispatch
    };
}
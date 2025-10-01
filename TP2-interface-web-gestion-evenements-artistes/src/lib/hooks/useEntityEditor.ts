import { createEventDispatcher } from "svelte";
import type { Artist, Event } from "$lib/types/pagination";
import { AppError } from "$lib/services/api.error";
import { getDataValidator } from "$lib/utils/validation/factories";

type Entity = Artist | Event;

interface UseEntityEditorOptions<T extends Entity> {
    entity: T;
    service: {
        update: (
            path: string,
            id: string,
            data: any
        ) => Promise<T | null>;
    };
    endpoint: string;
    minLabelLength?: number;
}

/**
 * Composable for managing entity editing logic.
 *
 * Provides common functionality for editing entities like Artists and Events:
 * - Local state management for editable fields
 * - Validation logic
 * - Save operation with API integration
 * - Event dispatching for parent components
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useEntityEditor } from "$lib/hooks/useEntityEditor";
 *
 *   export let artist: Artist;
 *   const artistService = createArtistService();
 *
 *   const { saveEntity } = useEntityEditor({
 *     entity: artist,
 *     service: artistService,
 *     endpoint: "/artists"
 *   });
 * </script>
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
     * Validates the label field.
     *
     * @param label - The label to validate.
     * @throws {AppError} If validation fails.
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
     * Saves the updated entity.
     *
     * @param updates - Partial updates to apply to the entity.
     * @returns The updated entity.
     * @throws {AppError} If validation or update fails.
     */
    async function saveEntity(updates: Partial<T>): Promise<T> {
        // Validate label if it's being updated
        if (updates.label !== undefined) {
            validateLabel(updates.label);
        }

        // Sanitize string fields
        const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string'
                ? validator.sanitizeString(value)
                : value;
            return acc;
        }, {} as any);

        const updated = await service.update(endpoint, entity.id, sanitizedUpdates);

        // Handle null response explicitly
        if (!updated) {
            throw new AppError(500, "Échec lors de la mise à jour");
        }

        // Dispatch updated event
        dispatch("updated", updated);

        return updated;
    }

    return {
        validateLabel,
        saveEntity,
        dispatch
    };
}
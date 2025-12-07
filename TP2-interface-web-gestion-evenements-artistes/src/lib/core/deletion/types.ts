/**
 * Configuration object for entity deletion operations.
 * 
 * Defines all necessary parameters for performing a safe entity deletion,
 * including service delegation, routing, and association warnings.
 * 
 * @template T - The type of entity being deleted (e.g., `Event`, `Artist`).
 * 
 * @example
 * ```typescript
 * const config: EntityDeletionConfig<Event> = {
 *   entityName: 'event',
 *   entityId: '123',
 *   endpoint: '/events',
 *   deleteService: (endpoint, id) => eventService.delete(endpoint, id),
 *   redirectRoute: '/events',
 *   associations: {
 *     count: 3,
 *     type: 'artist(s)',
 *     warningMessage: 'This event is linked to 3 artist(s).'
 *   }
 * };
 * ```
 */
export interface EntityDeletionConfig<T> {
    /**
     * Human-readable name of the entity type in singular form.
     * Used for generating confirmation and success messages.
     * 
     * @example "event", "artist"
     */
    entityName: string;

    /**
     * Unique identifier of the entity to be deleted.
     */
    entityId: string;

    /**
     * Unique identifier of the entity to be deleted.
     */
    endpoint: string;

    /**
     * Service method responsible for performing the deletion.
     * Should delegate to an existing service's `delete()` method.
     * 
     * @param endpoint - The API endpoint path.
     * @param id - The entity identifier.
     * @returns A promise that resolves to `true` if deletion succeeds.
     */
    deleteService: (endpoint: string, id: string) => Promise<boolean>;

    /**
     * Route path to redirect to after successful deletion.
     * 
     * @example "/events", "/artists"
     */
    redirectRoute: string;

    /**
     * Optional information about related entities that will also be affected.
     * If provided, displays a warning message to the user before deletion.
     */
    associations?: {
        /**
         * Number of associated entities.
         */
        count: number;

        /**
         * Human-readable type of the associated entities.
         */
        type: string;

        /**
         * Optional custom warning message displayed in the confirmation dialog.
         * If not provided, a default message will be generated.
         */
        warningMessage?: string;
    };
}
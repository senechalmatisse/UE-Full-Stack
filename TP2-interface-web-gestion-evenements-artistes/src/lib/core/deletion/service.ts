import { AppError } from '../services';
import type { EntityDeletionConfig } from './types';

/**
 * Service responsible for orchestrating entity deletion operations.
 * 
 * This service:
 * - Delegates actual deletion to the configured service method
 * - Provides standardized error handling
 * - Generates user-facing confirmation messages
 */
export class EntityDeletionService {
    /**
     * Deletes an entity using the provided configuration.
     * 
     * This method:
     * 1. Calls the configured delete service method
     * 2. Validates the operation result
     * 3. Throws standardized errors on failure
     * 
     * @template T - The type of entity being deleted.
     * @param config - Configuration object containing all deletion parameters.
     * @returns A promise that resolves to `true` if deletion succeeds.
     * 
     * @throws {AppError} With code 500 if the delete service returns `false`.
     * @throws {AppError} With code 500 if an unexpected error occurs.
     * @throws {AppError} Re-throws if the underlying service throws an AppError.
     */
    async deleteEntity<T>(config: EntityDeletionConfig<T>): Promise<boolean> {
        try {
            const success = await config.deleteService(config.endpoint, config.entityId);

            if (!success) {
                throw new AppError(
                    500, 
                    `Failed to delete ${config.entityName}`
                );
            }

            return true;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }

            throw new AppError(
                500, 
                `Error while deleting ${config.entityName}`
            );
        }
    }

    /**
     * Generates a user-facing confirmation message for the deletion operation.
     * 
     * The message includes:
     * - A base confirmation question
     * - Association warnings (if applicable)
     * - An irreversibility notice
     * 
     * @template T - The type of entity being deleted.
     * @param config - Configuration object containing entity and association info.
     * @returns A formatted confirmation message with newlines for readability.
     */
    getConfirmationMessage<T>(config: EntityDeletionConfig<T>): string {
        let message = `Are you sure you want to delete this ${config.entityName}?`;

        if (config.associations && config.associations.count > 0) {
            message += `\n\n${config.associations.warningMessage}`;
        }

        message += '\n\nThis action is irreversible.';

        return message;
    }
}

/**
 * Factory providing singleton access to {@link EntityDeletionService}.
 * 
 * Ensures only one service instance exists throughout the application lifecycle,
 * following the Singleton pattern used by other service factories in the codebase.
 */
export class EntityDeletionServiceFactory {
    /**
     * Cached singleton instance of the deletion service.
     * @private
     */
    private static instance: EntityDeletionService | null = null;

    /**
     * Returns the singleton instance of {@link EntityDeletionService}.
     * Creates the instance on first call, then returns the cached instance.
     * 
     * @returns The singleton {@link EntityDeletionService} instance.
     */
    static getInstance(): EntityDeletionService {
        if (!this.instance) this.instance = new EntityDeletionService();
        return this.instance;
    }
}

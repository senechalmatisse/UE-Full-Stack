<!--
/**
 * EntityDeletionHandler Component
 * 
 * A high-level component that manages the complete entity deletion workflow,
 * including user confirmation, API calls, notifications, and navigation.
 * 
 * Integrates with:
 * - {@link EntityDeletionService} for deletion orchestration
 * - {@link notifications} store for user feedback
 * - {@link AppError} for standardized error handling
 * - SvelteKit's `goto` for navigation after deletion
 * 
 * Workflow:
 * 1. User clicks the delete button
 * 2. Native confirmation dialog appears (via `window.confirm`)
 * 3. If confirmed, shows loading notification
 * 4. Calls the configured delete service method
 * 5. On success: shows success notification and redirects
 * 6. On error: shows error notification and dispatches error event
 * 
 * @component
 * 
 * @fires {deleted} Emitted after successful deletion, before navigation
 * @fires {error} Emitted when deletion fails, includes the AppError
 * 
 * @example Basic usage
 * ```svelte
 * <script>
 *   import { EntityDeletionConfigFactory, createEventService } from '$lib/core';
 *   
 *   const eventService = createEventService();
 *   const config = EntityDeletionConfigFactory.createEventDeletionConfig(
 *     event.id,
 *     eventService,
 *     event.artists.length
 *   );
 * </script>
 * 
 * <EntityDeletionHandler {config} variant="warning" />
 * ```
 * 
 * @example With event handlers
 * ```svelte
 * <EntityDeletionHandler 
 *   {config}
 *   on:deleted={() => console.log('Entity deleted')}
 *   on:error={(e) => console.error('Deletion failed:', e.detail)}
 * />
 * ```
 */
-->

<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import type { EntityDeletionConfig } from '$lib/core';
	import { EntityDeletionServiceFactory, AppError, getAppConfig } from '$lib/core';
	import { notifications } from '$lib/stores/notification.store';
	import DeleteButton from '$lib/components/shared/ui/DeleteButton.svelte';

	/**
     * Configuration object defining all deletion parameters.
     * Created via {@link EntityDeletionConfigFactory} factory methods.
     * 
     * @type {EntityDeletionConfig<any>}
     */
	export let config: EntityDeletionConfig<any>;

    /**
     * Visual variant of the delete button.
     * - `'danger'`: Filled red button (default for destructive actions)
     * - `'warning'`: Outlined red button (less aggressive visual)
     * 
     * @type {'danger' | 'warning'}
     * @default 'danger'
     */
	export let variant: 'danger' | 'warning' = 'danger';

	/**
     * Custom label for the delete button.
     * Defaults to "Supprimer".
     * 
     * @type {string}
     * @default "Supprimer"
     */
	export let buttonLabel: string = 'Supprimer';

    /**
     * Event dispatcher for component communication.
     * Emits 'deleted' on success and 'error' on failure.
     */
	const dispatch = createEventDispatcher<{
        /** Emitted after successful deletion, before navigation */
		deleted: void;
        /** Emitted when deletion fails, includes the error */
		error: AppError;
	}>();

    /** Singleton instance of the deletion service */
	const deletionService = EntityDeletionServiceFactory.getInstance();

    /** Application configuration for messages */
    const APP_CONFIG = getAppConfig();

    /**
     * Internal loading state.
     * When `true`, the delete button is disabled.
     * @private
     */
	let isDeleting = false;

/**
     * Handles the delete button click event.
     * 
     * Workflow:
     * 1. Generates and displays a confirmation dialog
     * 2. If user cancels, shows warning notification and exits
     * 3. If user confirms:
     *    - Sets loading state
     *    - Shows info notification
     *    - Calls delete service
     *    - On success: shows success notification, dispatches event, redirects
     *    - On error: shows error notification, dispatches error event
     * 4. Always clears loading state in finally block
     * 
     * @async
     * @private
     */
	async function handleDeleteClick() {
		const confirmationMessage = deletionService.getConfirmationMessage(config);

		if (!window.confirm(confirmationMessage)) {
			notifications.warning('Suppression annulée');
			return;
		}

		isDeleting = true;
		notifications.info(APP_CONFIG.messages.loading);

		try {
			await deletionService.deleteEntity(config);

			const entityNameCapitalized = config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
			notifications.success(`${entityNameCapitalized} supprimé avec succès`);

			dispatch('deleted');

			setTimeout(() => {
				goto(config.redirectRoute);
			}, 500);
		} catch (err) {
			const errorMessage = err instanceof AppError 
				? err.message 
				: APP_CONFIG.errors.messages.generic;

			notifications.error(`Erreur lors de la suppression : ${errorMessage}`);

			const appError = err instanceof AppError 
				? err 
				: new AppError(500, errorMessage);

			dispatch('error', appError);
		} finally {
			isDeleting = false;
		}
	}
</script>

<!-- Render the delete button with configured props -->
<DeleteButton 
	onClick={handleDeleteClick} 
	disabled={isDeleting} 
	label={buttonLabel} 
	{variant} 
/>
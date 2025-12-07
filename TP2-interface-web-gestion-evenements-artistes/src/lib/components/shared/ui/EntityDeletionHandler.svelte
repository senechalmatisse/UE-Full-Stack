<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import type { EntityDeletionConfig } from '$lib/core';
	import { EntityDeletionServiceFactory, AppError, getAppConfig } from '$lib/core';
	import { notifications } from '$lib/stores/notification.store';
	import DeleteButton from '$lib/components/shared/ui/DeleteButton.svelte';

	/**
	 * Configuration de suppression
	 */
	export let config: EntityDeletionConfig<any>;

	/**
	 * Variante du bouton
	 */
	export let variant: 'danger' | 'warning' = 'danger';

	/**
	 * Label personnalisé du bouton
	 */
	export let buttonLabel: string = 'Supprimer';

	const dispatch = createEventDispatcher<{
		deleted: void;
		error: AppError;
	}>();

	/** Service de suppression (singleton) */
	const deletionService = EntityDeletionServiceFactory.getInstance();
	const APP_CONFIG = getAppConfig();

	/** État de chargement */
	let isDeleting = false;

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
			const genderSuffix = config.entityName.endsWith('e') ? 'e' : '';
			notifications.success(`${entityNameCapitalized} supprimé${genderSuffix} avec succès`);

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
			console.error('Erreur de suppression:', err);
		} finally {
			isDeleting = false;
		}
	}
</script>

<DeleteButton 
	onClick={handleDeleteClick} 
	disabled={isDeleting} 
	label={buttonLabel} 
	{variant} 
/>
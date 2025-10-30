<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import type { IEntityCreationConfig, IFormField } from '$lib/core';
	import { ApiDateHelpers, ApiDateFormat } from '$lib/core';
	import { notifications } from '$lib/stores/notification.store';

	/**
	 * Configuration du formulaire de création
	 */
	export let config: IEntityCreationConfig<any>;

	const dispatch = createEventDispatcher<{ created: any; cancel: void }>();

	/** État du formulaire */
	let formData: Record<string, any> = {};
	let errors: Record<string, string> = {};
	let isSubmitting = false;

	/** Initialisation des valeurs par défaut */
	$: {
		config.fields.forEach(field => {
			if (!(field.name in formData)) {
				formData[field.name as string] = '';
			}
		});
	}

	/**
	 * Récupère tous les champs de type date
	 */
	function getDateFields(): Array<keyof typeof formData> {
		return config.fields
			.filter(f => f.type === 'date' || f.type === 'datetime-local')
			.map(f => f.name as keyof typeof formData);
	}

	/**
	 * Validation d'un champ individuel
	 */
	function validateField(field: IFormField): string | null {
		const value = formData[field.name as string];

		if (field.required && (!value || value.toString().trim().length === 0)) {
			return `${field.label} est requis`;
		}

		if (field.validation) {
			return field.validation(value);
		}

		return null;
	}

	/**
	 * Validation croisée pour les dates (événements)
	 */
	function validateCrossFields(): boolean {
		const startDateField = config.fields.find(f => f.name === 'startDate');
		const endDateField = config.fields.find(f => f.name === 'endDate');

		if (startDateField && endDateField) {
			const startDate = new Date(formData.startDate);
			const endDate = new Date(formData.endDate);

			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				return true; // Déjà géré par la validation individuelle
			}

			if (startDate > endDate) {
				errors.endDate = 'La date de fin doit être après la date de début';
				return false;
			}

			const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
			if (diffDays > 30) {
				errors.endDate = 'Un événement ne peut pas durer plus de 30 jours';
				return false;
			}
		}

		return true;
	}

	/**
	 * Validation complète du formulaire
	 */
	function validateForm(): boolean {
		errors = {};
		let isValid = true;

		config.fields.forEach(field => {
			const error = validateField(field);
			if (error) {
				errors[field.name as string] = error;
				isValid = false;
			}
		});

		if (isValid) {
			isValid = validateCrossFields();
		}

		return isValid;
	}

	/**
	 * Gestion du blur pour validation en temps réel
	 */
	function handleBlur(field: IFormField) {
		const error = validateField(field);
		if (error) {
			errors[field.name as string] = error;
		} else {
			delete errors[field.name as string];
		}
		errors = { ...errors };
	}

	/**
	 * Soumission du formulaire avec conversion des dates au format LocalDate
	 */
	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm()) {
			notifications.error('Veuillez corriger les erreurs dans le formulaire');
			return;
		}

		isSubmitting = true;
		notifications.info(`Création de ${config.entityName} en cours...`);

		try {
			// Préparation du payload
			const payload = { ...formData };
			
			// Récupération des champs de date
			const dateFields = getDateFields();
			
			// Conversion des dates au format LocalDate (YYYY-MM-DD) pour Spring Boot
			const convertedPayload = ApiDateHelpers.convertDates(
				payload,
				dateFields,
				ApiDateFormat.LOCAL_DATE
			);

			console.log('Payload avant conversion:', payload);
			console.log('Payload après conversion:', convertedPayload);

			const created = await config.createService(convertedPayload);

			if (!created) {
				throw new Error('Échec de la création');
			}

			notifications.success(
				`${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)} créé${config.entityName.endsWith('e') ? 'e' : ''} avec succès`
			);
			dispatch('created', created);

			// Redirection vers la liste
			await goto(config.listRoute);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Une erreur est survenue';
			notifications.error(`Erreur lors de la création : ${message}`);
			console.error('Erreur de création:', err);
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Annulation du formulaire
	 */
	function handleCancel() {
		dispatch('cancel');
		goto(config.listRoute);
	}
</script>

<div class="entity-creation-container">
	<header class="creation-header">
		<h1>Créer un nouvel {config.entityName}</h1>
		<p class="subtitle">Remplissez les informations ci-dessous</p>
	</header>

	<form on:submit={handleSubmit} class="creation-form" novalidate>
		{#each config.fields as field (field.name)}
			<div class="form-group" class:has-error={!!errors[field.name]}>
				<label for={field.name} class="form-label">
					{field.label}
					{#if field.required}
						<span class="required-indicator" aria-label="requis">*</span>
					{/if}
				</label>

				{#if field.type === 'textarea'}
					<textarea
						id={field.name}
						bind:value={formData[field.name]}
						placeholder={field.placeholder}
						required={field.required}
						disabled={isSubmitting}
						on:blur={() => handleBlur(field)}
						class="form-input"
						rows="4"
					/>
				{:else}
					<input
						id={field.name}
						type={field.type}
						bind:value={formData[field.name]}
						placeholder={field.placeholder}
						required={field.required}
						disabled={isSubmitting}
						on:blur={() => handleBlur(field)}
						class="form-input"
					/>
				{/if}

				{#if errors[field.name]}
					<span class="error-message" role="alert">
						{errors[field.name]}
					</span>
				{/if}
			</div>
		{/each}

		<div class="form-actions">
			<button
				type="button"
				on:click={handleCancel}
				disabled={isSubmitting}
				class="btn btn-secondary"
			>
				Annuler
			</button>

			<button
				type="submit"
				disabled={isSubmitting}
				class="btn btn-primary"
			>
				{#if isSubmitting}
					<span class="spinner" aria-hidden="true"></span>
					Création...
				{:else}
					Créer {config.entityName}
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
	.entity-creation-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.creation-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.creation-header h1 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.creation-form {
		background: white;
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group.has-error .form-input {
		border-color: #ef4444;
	}

	.form-label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.required-indicator {
		color: #ef4444;
		margin-left: 0.25rem;
	}

	.form-input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input:disabled {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}

	textarea.form-input {
		resize: vertical;
		min-height: 100px;
		font-family: inherit;
	}

	.error-message {
		display: block;
		color: #ef4444;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		border: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #e5e7eb;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 640px) {
		.entity-creation-container {
			margin: 1rem auto;
		}

		.creation-form {
			padding: 1.5rem;
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
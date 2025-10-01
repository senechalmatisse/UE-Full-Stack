<script lang="ts">
	import { tick } from 'svelte';

	/**
	 * LoadingState component.
	 *
	 * A generic UI component to handle **loading** and **error states**
	 * consistently across the application.
	 *
	 * Features:
	 * - Displays a spinner and message while loading.
	 * - Displays an error message with optional retry action.
	 * - Provides accessible roles (`status`, `alert`) with live region updates.
	 * - Supports slot overrides for customizing loading and error UIs.
	 *
	 * @example
	 * ```svelte
	 * <LoadingState
	 *   isLoading={isSaving}
	 *   error={saveError}
	 *   loadingMessage="Saving your changes..."
	 *   onRetry={() => retrySave()}
	 * />
	 * ```
	 */

	/** Loading state flag. When true, the loading indicator is displayed. */
	export let isLoading = false;

	/** Error message string. When not null, an error message is displayed. */
	export let error: string | null = null;

	/** Message to display during loading. Defaults to 'Loading...'. */
	export let loadingMessage = 'Chargement...';

	/**
	 * Optional retry callback.
	 * When provided, a "Retry" button will be rendered to allow the user
	 * to re-trigger the failed action.
	 */
	export let onRetry: (() => void) | null = null;

	/** Internal reference to the Retry button (autofocus when error appears). */
	let retryButton: HTMLButtonElement | null = null;

	// Automatically focus retry button when an error occurs and onRetry is defined
	$: if (error && onRetry) {
		tick().then(() => retryButton?.focus());
	}
</script>

{#if error}
	<div
        class="state-message"
        role="alert"
        aria-live="polite"
    >
		<!-- Error state slot -->
		<slot name="error" {error}>
			<p>{error}</p>
			{#if onRetry}
				<button
					bind:this={retryButton}
					class="retry-btn"
					on:click={onRetry}
					disabled={isLoading}
					aria-label="Réessayer l’action"
				>
					Réessayer
				</button>
			{/if}
		</slot>
	</div>
{:else if isLoading}
	<div
        class="state-loading"
        role="status"
        aria-live="polite"
        aria-label={loadingMessage}
    >
		<!-- Loading state slot -->
		<slot name="loading">
			<div class="loading-spinner" aria-hidden="true"></div>
			<p>{loadingMessage}</p>
		</slot>
	</div>
{/if}

<style>
    @import "$lib/styles/states/states.shared.css";
</style>
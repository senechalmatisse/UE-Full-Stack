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
        class="error-message"
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
        class="loading"
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
    /* Loading container styling */
    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #666;
    }

    /* Spinner animation */
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Error message container styling */
    .error-message {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-align: center;
    }

    /* Retry button styling */
    .retry-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: background-color 0.2s ease;
    }

    .retry-btn:hover:not(:disabled),
    .retry-btn:focus {
        background: #c82333;
        outline: 2px solid #c82333;
        outline-offset: 2px;
    }

    .retry-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
        .loading-spinner {
            animation: none;
        }
    }
</style>
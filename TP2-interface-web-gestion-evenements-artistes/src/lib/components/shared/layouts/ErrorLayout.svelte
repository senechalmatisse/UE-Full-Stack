<script lang="ts">
	import { APP_CONFIG, errorColors } from "$lib/config/app.config";
	import type { AppError } from "$lib/services/api.error";

	/** Type representing possible error formats supported by the layout. */
	type LayoutError =
		| AppError
		| Error
		| { message?: string; status?: number }
		| null;

	/**
	 * HTTP status code associated with the error.
	 * Defaults to `500` (Internal Server Error).
	 */
	export let httpStatus: number = 500;

	/**
	 * Error object containing details about the failure.
	 * Can be an `AppError`, native `Error`, or a plain object with optional fields.
	 */
	export let layoutError: LayoutError = null;

	/** Map of predefined error messages from configuration. */
	const errorMessageMap = APP_CONFIG.messages.error.map;

	/**
	 * Derived key used to resolve the error message
	 * from configuration based on the provided status code.
	 */
	$: errorKey = errorMessageMap[httpStatus] ?? "generic";

	/**
	 * Human-readable error message.
	 * Fallback order:
	 * 1. Configured error messages (based on `errorKey`)
	 * 2. `AppError.message`
	 * 3. Native `Error.message`
	 * 4. Generic fallback message
	 */
	$: errorMessage =
		APP_CONFIG.messages.error[errorKey] ||
		(layoutError as AppError)?.message ||
		(layoutError instanceof Error
			? layoutError.message
			: APP_CONFIG.messages.error.generic);

	/**
	 * Dynamic color for the error code heading.
	 * Based on `errorColors` mapping, falls back to crimson.
	 */
	$: errorColor = errorColors[httpStatus] ?? "crimson";
</script>

<main
	class="error-page"
	role="alert"
	aria-live="polite"
	aria-describedby="error-message"
	aria-label="Page d'erreur"
	lang="fr"
>
	<h1 class="error-code" style="color: {errorColor}">
		{httpStatus}
	</h1>

	<p id="error-message" class="error-message">{errorMessage}</p>

	<div class="error-actions">
		{#if httpStatus === 404}
			<a href="/" class="btn-primary">⬅ Retour à l’accueil</a>
		{:else if httpStatus === 403}
			<button on:click={() => history.back()} class="btn-secondary">
				Retour
			</button>
		{:else}
			<button on:click={() => location.reload()} class="btn-secondary">
				Réessayer
			</button>
		{/if}
	</div>

	<!-- Slot enriched with error context -->
	<slot {httpStatus} {errorMessage} {layoutError} />
</main>

<style>
    .error-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
        text-align: center;
        gap: 1rem;
        padding: 2rem;
    }

    .error-code {
        font-size: 4rem;
    }

    .error-message {
        font-size: 1.2rem;
        max-width: 40ch;
        color: #444;
    }

    .error-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    a,
    button {
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        text-decoration: none;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s ease;
    }

    .btn-primary {
        background: crimson;
        color: white;
    }

    .btn-secondary {
        background: #eee;
        border: 1px solid #ccc;
        color: #333;
    }

    .btn-primary:hover {
        background: #a3122f;
    }
</style>
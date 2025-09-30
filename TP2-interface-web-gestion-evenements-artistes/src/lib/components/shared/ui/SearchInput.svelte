<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search } from 'lucide-svelte';

	/** Current input value of the search field. */
	export let searchValue: string = '';

	/** Placeholder text for the search input field. */
	export let placeholder: string = 'Rechercher un artiste...';

	/**
	 * Delay (in milliseconds) before emitting the `search` event
	 * when the user is typing (debounce).
	 */
	export let debounceDelay: number = 500;

	/**
	 * Indicates if the component is in a loading state.
	 * Disables input and actions while loading.
	 */
	export let isLoading: boolean = false;

	/**
	 * Events dispatched by the SearchInput component.
	 * - `search`: Fired when a new search term is submitted or debounced.
	 * - `clear`: Fired when the search field is cleared.
	 */
	const dispatch = createEventDispatcher<{
		search: string;
		clear: void;
	}>();

	/** Timeout identifier used for debouncing search. */
	let debounceTimeoutId: number | null = null;

	/**
	 * Handles input change with debounce.
	 * Fires a `search` event after `debounceDelay`.
	 *
	 * @param event - Input event from the search field
	 */
	function onInputChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		searchValue = target.value;

		if (debounceTimeoutId !== null) {
			clearTimeout(debounceTimeoutId);
		}

		debounceTimeoutId = setTimeout(() => {
			dispatch('search', searchValue.trim());
		}, debounceDelay);
	}

	/**
	 * Handles form submission to trigger an immediate search.
	 *
	 * @param event - Form submit event
	 */
	function onFormSubmit(event: Event): void {
		event.preventDefault();

		if (debounceTimeoutId !== null) {
			clearTimeout(debounceTimeoutId);
			debounceTimeoutId = null;
		}

		dispatch('search', searchValue.trim());
	}

	/**
	 * Clears the search field and emits `clear` and `search` events.
	 */
	function onClearSearch(): void {
		searchValue = '';

		if (debounceTimeoutId !== null) {
			clearTimeout(debounceTimeoutId);
			debounceTimeoutId = null;
		}

		dispatch('clear');
		dispatch('search', '');
	}

	/**
	 * Handles keyboard shortcuts.
	 * - Escape: clears the search field if not empty.
	 *
	 * @param event - Keyboard event
	 */
	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && searchValue) {
			onClearSearch();
		}
	}
</script>

<form class="search-form" on:submit={onFormSubmit}>
	<div class="search-input-wrapper">
		<input
			type="search"
			class="search-input"
			bind:value={searchValue}
			{placeholder}
			disabled={isLoading}
			on:input={onInputChange}
			on:keydown={onKeydown}
			autocomplete="off"
		/>

		{#if searchValue}
			<button
				type="button"
				class="clear-button"
				on:click={onClearSearch}
				disabled={isLoading}
				aria-label="Effacer la recherche"
			>
				<span class="clear-icon">&times;</span>
			</button>
		{/if}

		{#if isLoading}
			<div class="loading-indicator">
				<span class="spinner"></span>
			</div>
		{/if}
	</div>

	<button
		type="submit"
		class="search-button"
		disabled={isLoading}
		aria-label="Rechercher"
	>
		<Search />
	</button>
</form>

<style>
	.search-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
        width: 100%;
        max-width: 400px;
	}

	.search-input-wrapper {
		position: relative;
		flex: 1;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 2px solid #e1e5e9;
		border-radius: 0.5rem;
		background-color: #fff;
		transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-input:disabled {
		background-color: #f9fafb;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.clear-button {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
	}

	.clear-button:hover:not(:disabled) {
		color: #374151;
		background-color: #f3f4f6;
	}

	.clear-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clear-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.loading-indicator {
		position: absolute;
		right: 2.5rem;
		top: 50%;
		transform: translateY(-50%);
	}

	.spinner {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border: 2px solid #e1e5e9;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.search-button {
		padding: 0.75rem 1rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		font-size: 1rem;
		min-width: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-button:hover:not(:disabled) {
		background-color: #b6c3df;
	}

	.search-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.search-form {
			max-width: none;
		}

		.search-input {
			font-size: 1rem;
		}
	}
</style>
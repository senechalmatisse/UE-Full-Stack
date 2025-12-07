<!--
/**
 * DeleteButton Component
 * 
 * A reusable button component specifically designed for delete operations.
 * Provides visual feedback through color variants and includes an accessible
 * trash icon.
 * 
 * Features:
 * - Two visual variants: 'danger' (filled red) and 'warning' (outlined red)
 * - Integrated trash icon for visual clarity
 * - Disabled state support
 * - Full keyboard accessibility
 * - Hover and focus states
 * 
 * @component
 * 
 * @example Basic usage
 * ```svelte
 * <DeleteButton 
 *   onClick={handleDelete} 
 *   label="Delete Event"
 * />
 * ```
 * 
 * @example With warning variant
 * ```svelte
 * <DeleteButton 
 *   onClick={handleDelete}
 *   variant="warning"
 *   label="Remove"
 *   disabled={isProcessing}
 * />
 * ```
 */
-->

<script lang="ts">
    /**
     * Callback function executed when the button is clicked.
     * Should handle the deletion logic or open a confirmation dialog.
     * 
     * @type {() => void}
     */
	export let onClick: () => void;

    /**
     * Whether the button is disabled.
     * When `true`, the button is not clickable and appears faded.
     * 
     * @type {boolean}
     * @default false
     */
	export let disabled: boolean = false;

    /**
     * Text label displayed next to the trash icon.
     * Also used as the `aria-label` for screen readers.
     * 
     * @type {string}
     * @default "Supprimer"
     */
	export let label: string = 'Supprimer';

    /**
     * Visual variant of the button.
     * - `'danger'`: Filled red background (destructive action)
     * - `'warning'`: Outlined red border with white background (less aggressive)
     * 
     * @type {'danger' | 'warning'}
     * @default 'danger'
     */
	export let variant: 'danger' | 'warning' = 'danger';
</script>

<button
	on:click={onClick}
	{disabled}
	class="delete-button"
	class:danger={variant === 'danger'}
	class:warning={variant === 'warning'}
	aria-label={label}
>
    <!-- Trash icon from Lucide/Feather icon set -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<polyline points="3 6 5 6 21 6"></polyline>
		<path
			d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
		></path>
		<line x1="10" y1="11" x2="10" y2="17"></line>
		<line x1="14" y1="11" x2="14" y2="17"></line>
	</svg>
	<span>{label}</span>
</button>

<style>
	.delete-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
	}

	.delete-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.delete-button.danger {
		background-color: #dc2626;
		color: white;
		border-color: #dc2626;
	}

	.delete-button.danger:hover:not(:disabled) {
		background-color: #b91c1c;
		border-color: #b91c1c;
	}

	.delete-button.warning {
		background-color: white;
		color: #dc2626;
		border-color: #dc2626;
	}

	.delete-button.warning:hover:not(:disabled) {
		background-color: #fef2f2;
	}

	.delete-button:focus-visible {
		outline: 2px solid #dc2626;
		outline-offset: 2px;
	}
</style>
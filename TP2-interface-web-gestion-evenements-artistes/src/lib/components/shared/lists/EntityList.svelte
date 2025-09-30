<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    /**
     * EntityList component.
     *
     * A generic and reusable list component designed to display
     * collections of entities (e.g., artists, events).
     *
     * Features:
     * - Handles empty states with optional search reset.
     * - Displays an item counter when enabled.
     * - Provides accessible markup (`aria-live`, `role="status"`).
     * - Allows customization of the empty state and list items through slots.
     *
     * @example
     * ```svelte
     * <EntityList
     *   items={artists}
     *   entityLabel="artists"
     *   emptyMessage="No artists found."
     *   showCount={true}
     *   searchQuery={search}
     *   on:clear={() => resetSearch()}
     * >
     *   <li slot="default" let:items>
     *     {#each items as artist}
     *       <ArtistCard {artist} />
     *     {/each}
     *   </li>
     * </EntityList>
     * ```
     */

    // Define generic item type
    type T = $$Generic;

    /** Items to display (generic list of entities). */
    export let items: T[] = [];

    /** Message displayed when the list is empty. */
    export let emptyMessage: string = 'Aucun item trouvé.';

    /** Label used for accessibility and counters (e.g., "artists" or "events"). */
    export let entityLabel: string = 'items';

    /** Whether to display the counter above the list. */
    export let showCount: boolean = true;

    /** Current search query (used in empty state & counter). */
    export let searchQuery: string = '';

    /**
     * Event dispatcher.
     *
     * @event clear - Emitted when the user requests to clear the search query.
     */
    const dispatch = createEventDispatcher<{ clear: void }>();

    /** Handles the clear search action and dispatches the `clear` event. */
    function handleClear() {
        dispatch('clear');
    }
</script>

{#if !items || items.length === 0}
	<div
		class="entity-empty-container"
		role="status"
		aria-live="polite"
		aria-label="Liste vide des {entityLabel}"
	>
		<!-- Empty state slot -->
		<slot name="empty">
			<p class="entity-empty-title">{emptyMessage}</p>
			{#if searchQuery}
				<p class="entity-empty-suggestion">
					Essayez un autre terme ou
					<button
						class="clear-search-link"
						on:click={handleClear}
						aria-label="Réinitialiser la recherche"
					>
						voir tous les {entityLabel}
					</button>
				</p>
			{/if}
		</slot>
	</div>
{:else}
	<div
		class="entity-list-container"
		role="status"
		aria-live="polite"
		aria-label="Liste des {entityLabel}"
	>
		{#if showCount}
			<div class="entity-count" aria-live="polite">
				{items.length} {entityLabel}{items.length > 1 ? 's' : ''}
				{#if searchQuery} pour "{searchQuery}" {/if}
			</div>
		{/if}
		<ul class="entity-list">
			<!-- Default slot for rendering list items -->
			<slot {items} />
		</ul>
	</div>
{/if}

<style>
	.entity-list-container {
		margin-bottom: 2rem;
	}

	.entity-count {
		margin-bottom: 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
		padding: 0.5rem 0;
	}

	.entity-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	/* Empty state */
	.entity-empty-container {
		text-align: center;
		padding: 3rem 1rem;
		color: #6b7280;
	}

	.entity-empty-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.entity-empty-suggestion {
		font-size: 0.875rem;
		color: #9ca3af;
	}

	.clear-search-link {
		background: none;
		border: none;
		color: #3b82f6;
		text-decoration: underline;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
		margin: 0;
	}

	.clear-search-link:hover,
	.clear-search-link:focus {
		color: #2563eb;
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 2px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.entity-list {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.entity-empty-container {
			padding: 2rem 1rem;
		}

		.entity-empty-title {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 480px) {
		.entity-list {
			gap: 0.75rem;
		}

		.entity-count {
			font-size: 0.8125rem;
		}
	}
</style>
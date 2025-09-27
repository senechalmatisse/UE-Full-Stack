import type { SvelteComponentTyped } from "svelte";

/**
 * Generic wrapper type for the EntityList.svelte component.
 *
 * @template T The type of items in the list.
 */
export default class EntityList<T> extends SvelteComponentTyped<
	{
		/** Items to display in the list. */
		items?: T[];
		/** Message displayed when the list is empty. */
		emptyMessage?: string;
		/** Accessibility label for the type of entity ("artist", "event", etc.). */
		entityLabel?: string;
		/** Whether to show a counter above the list. */
		showCount?: boolean;
		/** Current search query (for empty state & counter). */
		searchQuery?: string;
	},
	{
		/** Emitted when the user requests to clear the search query. */
		clear: CustomEvent<void>;
	},
	{
		/**
		 * Default slot used to render items.
		 * Exposes the `items` array to the parent.
		 */
		default: { items: T[] };
		/**
		 * Optional slot for customizing the empty state UI.
		 */
		empty: Record<string, never>;
	}
> {}
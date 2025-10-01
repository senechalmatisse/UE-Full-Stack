import type { SvelteComponentTyped } from "svelte";

/**
 * Generic wrapper type for the `EntityList.svelte` component.
 *
 * This component provides a reusable way to display a list of entities
 * (e.g., artists, events) with built-in support for:
 * - Empty state messages
 * - Accessibility labels
 * - Optional item counters
 * - Slots for customizing rendering
 *
 * @template T The type of items contained in the list.
 */
export default class EntityList<T> extends SvelteComponentTyped<
	{
		/**
		 * The list of items to display.
		 * 
		 * Defaults to an empty array if not provided.
		 */
		items?: T[];

		/**
		 * Message displayed when no items are available.
		 * 
		 * @default "No items found."
		 */
		emptyMessage?: string;

		/**
		 * Accessibility label for the type of entity displayed.
		 * 
		 * Example: `"artist"`, `"event"`.
		 */
		entityLabel?: string;

		/**
		 * Whether to show a counter above the list,
		 * indicating the number of items currently displayed.
		 * 
		 * @default false
		 */
		showCount?: boolean;

		/**
		 * Current search query, used to display contextual
		 * empty messages and counter information.
		 */
		searchQuery?: string;
	},
	{
		/**
		 * Fired when the user requests to clear the current search query.
		 */
		clear: CustomEvent<void>;
	},
	{
		/**
		 * Default slot for rendering list items.
		 * 
		 * Exposes the `items` array to the parent scope.
		 */
		default: { items: T[] };

		/**
		 * Optional slot for customizing the empty state UI.
		 */
		empty: Record<string, never>;
	}
> {}
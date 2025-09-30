<script lang="ts">
    import { ArrowRight } from "lucide-svelte";

    /**
     * Base card component.
     *
     * Provides a reusable skeleton for list items such as events or artists.
     * Includes:
     * - A header with a title and optional badge
     * - A customizable content area
     * - A footer with a navigation link
     *
     * Supports an optional animation delay for staggered appearance
     * and a loading state to disable interaction.
     *
     * @example
     * ```svelte
     * <CardBase
     *   id="event-1"
     *   title="My Event"
     *   linkHref="/events/1"
     *   linkLabel="View details"
     *   badgeCount={3}
     *   animationDelay={150}
     *   isLoading={false}
     * >
     *   <div slot="content">
     *     <p>Custom content goes here...</p>
     *   </div>
     * </CardBase>
     * ```
     */

    /** Unique identifier for the card. */
    export let id: string;

    /** Title displayed in the card header. */
    export let title: string;

    /** Destination URL for the footer link. */
    export let linkHref: string;

    /** Label text displayed inside the footer link. */
    export let linkLabel: string;

    /** Optional numeric badge displayed in the header (e.g., number of associations). */
    export let badgeCount: number | null = null;

    /** Delay (in milliseconds) applied to the CSS animation for staggered appearance. */
    export let animationDelay = 0;

    /**
     * Loading state flag.
     * When true, the card is visually dimmed and interaction is disabled.
     */
    export let isLoading = false;
</script>

<li
    id={id}
    class="card"
    class:loading={isLoading}
    style="animation-delay: {animationDelay}ms"
    aria-labelledby={id + "-title"}
>
    <header class="card-header">
        <h2 id={id + "-title"} class="card-title">{title}</h2>

        {#if badgeCount !== null && badgeCount > 0}
            <div class="badge">{badgeCount}</div>
        {/if}
    </header>

    <div class="card-content">
        <!-- Slot for injecting custom content inside the card body -->
        <slot name="content" />
    </div>

    <footer class="card-footer">
        <a href={linkHref} class="card-link" aria-label={`Voir les détails de ${title}`}>
            <span>{linkLabel}</span>
            <ArrowRight size={16} />
        </a>
    </footer>
</li>

<style>
    @import '$lib/styles/card.css';

    /* Visual state when card is loading */
    .card.loading {
        opacity: 0.7;
        pointer-events: none;
    }
</style>
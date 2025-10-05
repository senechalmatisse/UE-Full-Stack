<script lang="ts">
    /**
     * Root layout component for the entire SvelteKit application.
     *
     * @fileoverview
     * This layout serves as the main structural wrapper for all routes in the app.
     * It ensures a consistent layout, navigation, and notification experience
     * across all pages.
     *
     * ## Responsibilities
     * - Defines the shared application layout used by all child routes.
     * - Renders the global navigation bar (`NavigationBar`).
     * - Includes a persistent global notification system (`Notification`) for user feedback.
     * - Provides a `<slot />` for nested route components.
     *
     * ## Components
     * - **NavigationBar** — Global navigation header rendered at the top of the layout.
     * - **Notification** — Global notification/toast system for user messages and alerts.
     *
     * @remarks
     * This component is automatically used as a layout by SvelteKit for all routes
     * in its directory. Any route rendered within this layout will appear inside the `<slot />`.
     *
     * @example
     * ```svelte
     * <!-- Example usage: +layout.svelte -->
     * <NavigationBar />
     * <slot /> <!-- Child pages are rendered here -->
     * <Notification />
     * ```
     */
    import Notification from '$lib/components/shared/ui/Notification.svelte';
    import NavigationBar from '$lib/components/shared/navigation/NavigationBar.svelte';
</script>

<!-- Global navigation header -->
<NavigationBar />

<!-- Slot for rendering child routes and page content -->
<slot />

<!-- Global notification container for user feedback -->
<Notification />
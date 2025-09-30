<script lang="ts">
    import { notifications } from '$lib/stores/notification.store';

    /**
     * Notification component.
     *
     * Displays a stack of notifications coming from the global `notifications` store.
     * Supports four notification types (`success`, `error`, `info`, `warning`),
     * optional action buttons, and manual dismissal via a close button.
     *
     * Accessibility:
     * - Uses `role="alert"` and `aria-live="assertive"` to announce messages to screen readers.
     * - Close and action buttons are fully keyboard-accessible.
     *
     * @example
     * ```svelte
     * <!-- Triggering a notification -->
     * <button on:click={() => notifications.success("Saved successfully!")}>
     *   Show Success
     * </button>
     *
     * <!-- Container -->
     * <Notification />
     * ```
     */
</script>

<div class="notification-container">
	{#each $notifications as notif (notif.id)}
		<div class="notification {notif.type}" role="alert" aria-live="assertive">
			<span>{notif.message}</span>

            {#if notif.actions}
				<div class="notification-actions">
					{#each notif.actions as action}
						<button
							class="notification-action-btn"
							on:click={() => {
								action.callback();
								notifications.remove(notif.id);
							}}
						>
							{action.label}
						</button>
					{/each}
				</div>
			{/if}

			<button
				on:click={() => notifications.remove(notif.id)}
				class="notification-close-btn"
				aria-label="Fermer la notification"
			>
				&times;
			</button>
		</div>
	{/each}
</div>

<style>
    /* === Container === */
    .notification-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
    }

    /* === Notification === */
    .notification {
        padding: 0.75rem 1rem;
        border-radius: 6px;
        color: white;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 200px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        animation: fadein 0.3s ease-out;
    }

    /* Notification types */
    .notification.success { background-color: #16a34a; }
    .notification.error   { background-color: #dc2626; }
    .notification.info    { background-color: #2563eb; }
    .notification.warning { background-color: #d97706; }

    /* Actions */
    .notification-actions {
        display: flex;
        gap: 0.4rem;
        margin-left: auto;
    }

    .notification-action-btn {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background-color 0.2s ease;
    }

    .notification-action-btn:hover {
        background-color: rgba(255, 255, 255, 0.35);
    }

    /* === Close button === */
    .notification-close-btn {
        margin-left: .5rem;
        background-color: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-size: 1.1rem;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .notification-close-btn:hover {
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }

    .notification-close-btn:focus {
        outline: 2px solid white;
        outline-offset: 2px;
    }

    /* === Fade-in animation === */
    @keyframes fadein {
        from { opacity: 0; transform: translateX(10px); }
        to { opacity: 1; transform: translateX(0); }
    }
</style>
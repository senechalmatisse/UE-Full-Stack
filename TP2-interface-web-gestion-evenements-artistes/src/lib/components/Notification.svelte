<script lang="ts">
    import { notifications, type Notification } from '../stores/notification.store';
</script>

<div class="notification-container">
	{#each $notifications as notif (notif.id)}
		<div class="notification {notif.type}">
			{notif.message}
			<button on:click={() => notifications.remove(notif.id)}>x</button>
		</div>
	{/each}
</div>

<style>
	.notification-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		gap: .5rem;
		z-index: 1000;
	}

	.notification {
		padding: .75rem 1rem;
		border-radius: 6px;
		color: white;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-width: 200px;
		box-shadow: 0 2px 6px rgba(0,0,0,0.15);
		animation: fadein .3s ease-out;
	}

	.notification.success { background: #16a34a; }
	.notification.error { background: #dc2626; }
	.notification.info { background: #2563eb; }
	.notification.warning { background: #d97706; }

	button {
		background: transparent;
		border: none;
		color: inherit;
		font-size: 1rem;
		cursor: pointer;
	}
	@keyframes fadein {
		from { opacity: 0; transform: translateX(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
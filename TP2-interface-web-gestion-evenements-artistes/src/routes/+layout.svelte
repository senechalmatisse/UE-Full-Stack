<script lang="ts">
  /**
   * Layout component for all routes in the application.
   *
   * Responsibilities:
   * - Provides a consistent page structure for all child routes via <slot />.
   * - Integrates a global notification system for user feedback.
   *
   * Components:
   * - Notification: Displays toast messages or alerts triggered by any child page.
   */
  import Notification from '../lib/components/Notification.svelte';
</script>

<!-- Slot renders child routes/components -->
<slot />

<!-- Global notification component for user feedback -->
<Notification />
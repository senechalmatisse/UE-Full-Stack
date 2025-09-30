<script lang="ts">
	import { page } from '$app/stores';
	import ErrorLayout from "$lib/components/shared/layouts/ErrorLayout.svelte";

    /**
     * Error object received from the SvelteKit routing or server.
     * Can be a plain object or an `Error` instance.
     * Includes optional message, stack trace, and HTTP status.
     */
	export let error: {
        message?: string;
        stack?: string;
        status?: number
    } | Error;

    /**
     * HTTP status code associated with the error.
     * Falls back to `$page.status` or `500` if not provided.
     */
	export let status: number | undefined;
</script>

<ErrorLayout
    httpStatus={status ?? $page.status ?? 500}
    layoutError={error}
/>
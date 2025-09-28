<script lang="ts">
	import { page } from '$app/stores';
	import ErrorLayout from "$lib/components/shared/layouts/ErrorLayout.svelte";

	export let error: { message?: string; stack?: string; status?: number } | Error;

	export let status: number | undefined;
</script>

<ErrorLayout
    httpStatus={status ?? $page.status ?? 500}
    layoutError={error}
/>
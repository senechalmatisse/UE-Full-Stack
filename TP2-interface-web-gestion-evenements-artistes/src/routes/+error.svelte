<script lang="ts">
	import ErrorLayout from "$lib/components/ErrorLayout.svelte";
	import { page } from '$app/stores';

	export let error: { message?: string; stack?: string; status?: number } | Error;

	export let status: number | undefined;
</script>

<ErrorLayout
    httpStatus={status ?? $page.status ?? 500}
    layoutError={error}
/>
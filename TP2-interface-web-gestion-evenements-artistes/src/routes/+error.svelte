<script lang="ts">
	import ErrorLayout from "$lib/components/ErrorLayout.svelte";
	import { page } from '$app/stores';

	// Typage plus précis : AppError ou Error standard
	export let error: { message?: string; stack?: string; status?: number } | Error;
	export let status: number | undefined;
</script>

<ErrorLayout status={status ?? $page.status ?? 500} {error} />
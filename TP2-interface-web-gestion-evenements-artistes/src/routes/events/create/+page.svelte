<script lang="ts">
	import EntityCreationForm from '$lib/components/shared/forms/EntityCreationForm.svelte';
	import { EntityConfigFactory, createEventService } from '$lib/core';
	import type { PageData } from './$types';

	export let data: PageData;

	const eventService = createEventService();
	const config = EntityConfigFactory.createEventConfig(eventService);
</script>

<svelte:head>
	<title>Créer un événement</title>
	<meta name="description" content="Créer un nouvel événement dans la base de données" />
</svelte:head>

<EntityCreationForm {config} />
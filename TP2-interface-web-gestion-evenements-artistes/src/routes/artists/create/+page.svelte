<script lang="ts">
	import EntityCreationForm from '$lib/components/shared/forms/EntityCreationForm.svelte';
	import { EntityConfigFactory, createArtistService } from '$lib/core';
	import type { PageData } from './$types';

	export let data: PageData;

	const artistService = createArtistService();
	const config = EntityConfigFactory.createArtistConfig(artistService);
</script>

<svelte:head>
	<title>Créer un artiste</title>
	<meta name="description" content="Créer un nouvel artiste dans la base de données" />
</svelte:head>

<EntityCreationForm {config} />
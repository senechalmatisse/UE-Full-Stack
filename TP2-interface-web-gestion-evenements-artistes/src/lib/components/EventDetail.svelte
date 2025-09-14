<script lang="ts">
	import type { Event } from '../types/pagination';
	import { createEventService } from '../services/event.service';
	import { DateFormatterFactory } from '../utils/formatters';
	import { createEventDispatcher } from 'svelte';

	export let event: Event;

	const eventService = createEventService();
	const dateFormatter = DateFormatterFactory.getFrenchFormatter();
	const dispatch = createEventDispatcher<{ updated: Event }>();

	let label = event.label;
	let startDate = event.startDate;
	let endDate = event.endDate;
	let isSaving = false;
	let errorMessage: string | null = null;

	async function save() {
		errorMessage = null;

		if (!label.trim()) {
			errorMessage = 'Le nom est obligatoire';
			return;
		}

		if (new Date(startDate) >= new Date(endDate)) {
			errorMessage = 'La date de fin doit être après la date de début';
			return;
		}

		isSaving = true;
		try {
			const updated = await eventService.updateEvent(event.id, { label, startDate, endDate });
			event = updated;
            dispatch('updated', updated);
		} catch (e) {
			errorMessage = 'Erreur lors de la mise à jour';
			console.error(e);
		} finally {
			isSaving = false;
		}
	}
</script>

<section>
	<h2>Informations sur l’événement</h2>

	<form on:submit|preventDefault={save}>
		<div>
			<label for="label">Nom</label>
			<input id="label" bind:value={label} required />
		</div>

		<div>
			<label for="startDate">Date de début</label>
			<input type="date" id="startDate" bind:value={startDate} required />
		</div>

		<div>
			<label for="endDate">Date de fin</label>
			<input type="date" id="endDate" bind:value={endDate} required />
		</div>

		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}

		<button type="submit" disabled={isSaving}>
			{isSaving ? 'Enregistrement...' : 'Enregistrer'}
		</button>
	</form>

	<p>
		Du <time datetime={event.startDate}>{dateFormatter.format(event.startDate)}</time>
		au <time datetime={event.endDate}>{dateFormatter.format(event.endDate)}</time>
	</p>
</section>

<style>
	.error { color: red; }
	form { display: flex; flex-direction: column; gap: .5rem; }
</style>
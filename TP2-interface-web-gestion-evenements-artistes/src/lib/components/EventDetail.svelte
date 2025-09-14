<script lang="ts">
	import type { Event } from '../types/pagination';
	import { createEventService } from '../services/event.service';
	import { DateFormatterFactory } from '../utils/formatters';
	import { createEventDispatcher } from 'svelte';
    import { notifications } from '../stores/notification.store';

	export let event: Event;

	const eventService = createEventService();
	const dateFormatter = DateFormatterFactory.getFrenchFormatter();
	const dispatch = createEventDispatcher<{ updated: Event }>();

	let label = event.label;
	let startDate = event.startDate;
	let endDate = event.endDate;
	let isSaving = false;

	async function save() {
		if (!label.trim()) {
    		notifications.error('Le nom est obligatoire');
			return;
		}

		if (new Date(startDate) >= new Date(endDate)) {
    		notifications.error('La date de fin doit être après la date de début');
			return;
		}

		isSaving = true;
		try {
			const updated = await eventService.updateEvent(event.id, { label, startDate, endDate });
			event = updated;
            dispatch('updated', updated);
    		notifications.success('Événement mis à jour avec succès');
		} catch (e) {
    		notifications.error('Erreur lors de la mise à jour');
		} finally {
			isSaving = false;
		}
	}
</script>

<section>
	<h2>Informations sur l’événement</h2>

	<p>
		Du <time datetime={event.startDate}>{dateFormatter.format(event.startDate)}</time>
		au <time datetime={event.endDate}>{dateFormatter.format(event.endDate)}</time>
	</p>

	<form on:submit|preventDefault={save}>
		<div>
			<label for="label">Nom</label>
			<input id="label" bind:value={label} minlength="3" required />
		</div>

		<div>
			<label for="startDate">Date de début</label>
			<input type="date" id="startDate" bind:value={startDate} required />
		</div>

		<div>
			<label for="endDate">Date de fin</label>
			<input type="date" id="endDate" bind:value={endDate} required />
		</div>

		<button type="submit" disabled={isSaving}>
			{isSaving ? 'Enregistrement...' : 'Enregistrer'}
		</button>
	</form>
</section>

<style>
	form {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
</style>
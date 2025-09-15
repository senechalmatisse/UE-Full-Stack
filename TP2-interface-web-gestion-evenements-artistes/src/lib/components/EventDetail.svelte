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

<section class:is-saving={isSaving}>
    <h2>Informations sur l’événement</h2>

    <p class="event-dates">
        Du <time datetime={event.startDate}>{dateFormatter.format(event.startDate)}</time>
        au <time datetime={event.endDate}>{dateFormatter.format(event.endDate)}</time>
    </p>

    <form on:submit|preventDefault={save} class:is-saving={isSaving}>
        <div class="form-row">
            <label for="label">Nom</label>
            <input id="label" bind:value={label} minlength="3" required />
        </div>

        <div class="form-group">
            <label for="startDate">Date de début</label>
            <input type="date" id="startDate" bind:value={startDate} required />
        </div>

        <div class="form-group">
            <label for="endDate">Date de fin</label>
            <input type="date" id="endDate" bind:value={endDate} required />
        </div>

        <button type="submit" disabled={isSaving} class="submit-btn">
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
    </form>
</section>

<style>
/* === Container === */
section {
  background-color: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  margin: 2rem auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, opacity 0.3s ease;
}

section.is-saving {
  opacity: 0.6;
  box-shadow: none;
}

/* === Headings & Dates === */
h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: center;
}

.event-dates {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  text-align: center;
  transition: color 0.3s ease;
}

section.is-saving .event-dates {
  color: #999;
}

/* === Form === */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: opacity 0.3s ease;
}

form.is-saving {
  opacity: 0.6;
  pointer-events: none;
}

/* === Form Fields === */
.form-row,
.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

label {
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: #34495e;
}

input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* === Submit Button === */
.submit-btn {
  background-color: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
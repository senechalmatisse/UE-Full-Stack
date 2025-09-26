<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Event } from '../types/pagination';
	import { createEventService } from '../services/event.service';
	import { DateFormatterFactory } from '../utils/formatters';
    import { notifications } from '../stores/notification.store';
	import { AppError } from '../services/api.error';

	/**
	 * Event object provided as a prop.
	 * Contains all details about the current event being edited.
	 */
	export let event: Event;

	/** Service instance responsible for interacting with the Event API. */
	const eventService = createEventService();

	/** French date formatter used for displaying event dates. */
	const frenchDateFormatter = DateFormatterFactory.getFrenchFormatter();

	/** Svelte event dispatcher to notify parent components */
	const dispatch = createEventDispatcher<{ updated: Event }>();

	/** Local form state variables */
	let eventLabel: string = event.label;
	let eventStartDate: string = event.startDate;
	let eventEndDate: string = event.endDate;

	/** Indicates whether the form is currently saving. */
	let isSaving: boolean = false;

    /**
	 * Saves the updated event.
	 *
	 * - Validates form input.
	 * - Updates the event via EventService.
	 * - Dispatches `updated` event with updated data.
	 * - Displays notifications for success or failure.
	 */
	async function handleSave(): Promise<void> {
		if (!eventLabel.trim()) {
			notifications.error('Event name is required');
			return;
		}

		if (new Date(eventStartDate) >= new Date(eventEndDate)) {
			notifications.error('End date must be after start date');
			return;
		}

		await executeWithLoading(async () => {
            const updatedEvent = await eventService.update('/events', event.id, {
				label: eventLabel,
				startDate: eventStartDate,
				endDate: eventEndDate
			});

			if (!updatedEvent) {
				throw new AppError(500, 'Mise à jour échouée');
			}

			event = updatedEvent;
			dispatch('updated', updatedEvent);
			notifications.success('Événement mis à jour avec succès');
		}, 'Erreur lors de la mise à jour');
	}

	/**
	 * Wrapper to manage saving state and handle error notifications.
	 *
	 * @param action - Async function containing the main logic
	 * @param fallbackErrorMessage - Message displayed if action fails
	 */
	async function executeWithLoading(
		action: () => Promise<void>,
		fallbackErrorMessage: string
	): Promise<void> {
		isSaving = true;

		try {
			await action();
		} catch (error: unknown) {
			if (error instanceof AppError) {
				notifications.error(error.message);
			} else {
				notifications.error(fallbackErrorMessage);
			}
		} finally {
			isSaving = false;
		}
	}
</script>

<section class:is-saving={isSaving}>
    <h2>Informations sur l’événement</h2>

    <p class="event-dates">
        Du <time datetime={event.startDate}>{frenchDateFormatter.format(event.startDate)}</time>
        au <time datetime={event.endDate}>{frenchDateFormatter.format(event.endDate)}</time>
    </p>

    <form on:submit|preventDefault={handleSave} class:is-saving={isSaving}>
        <div class="form-row">
            <label for="label">Nom</label>
            <input id="label" bind:value={eventLabel} minlength="3" required />
        </div>

        <div class="form-group">
            <label for="startDate">Date de début</label>
            <input type="date" id="startDate" bind:value={eventStartDate} required />
        </div>

        <div class="form-group">
            <label for="endDate">Date de fin</label>
            <input type="date" id="endDate" bind:value={eventEndDate} required />
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
<script lang="ts">
    import EditableForm from "./EditableForm.svelte";
    import type { Event } from "$lib/types/pagination";
    import { createEventService } from "$lib/services/event.service";
    import { DateFormatterFactory } from "$lib/utils/formatters";
    import { createEventDispatcher } from "svelte";
    import { DataValidator } from "$lib/utils/validation";
    import { AppError } from "$lib/services/api.error";

    export let event: Event;

    const eventService = createEventService();
    const frenchDateFormatter = DateFormatterFactory.getFrenchFormatter();
    const dispatch = createEventDispatcher<{ updated: Event }>();

    // Champs contrôlés
    let eventLabel = event.label;
    let eventStartDate = event.startDate;
    let eventEndDate = event.endDate;

    /** Validation centralisée */
    function validateForm(): void {
        if (eventLabel.trim().length < 3) {
            throw new AppError(400, "Le nom doit contenir au moins 3 caractères");
        }

        const start = new Date(eventStartDate);
        const end = new Date(eventEndDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new AppError(400, "Les dates doivent être valides");
        }

        if (start >= end) {
            throw new AppError(400, "La date de fin doit être après celle du début");
        }
    }

    async function saveEvent() {
        validateForm();

        const updated = await eventService.update("/events", event.id, {
            label: DataValidator.sanitizeString(eventLabel),
            startDate: DataValidator.sanitizeString(eventStartDate),
            endDate: DataValidator.sanitizeString(eventEndDate),
        });

        if (!updated) throw new AppError(500, "Échec lors de la mise à jour de l'événement");

        // synchro locale en une seule assignation
        event = { ...event, ...updated };

        // dispatch vers le parent (+page.svelte)
        dispatch("updated", event);

        return event;
    }
</script>

<EditableForm
    title="Informations sur l’événement"
    onSave={saveEvent}
    successMessage="Événement mis à jour avec succès"
>
    <p class="event-dates">
        Du <time datetime={event.startDate}>{frenchDateFormatter.format(event.startDate)}</time>
        au <time datetime={event.endDate}>{frenchDateFormatter.format(event.endDate)}</time>
    </p>

    <div class="form-row">
        <label for="label">Nom</label>
        <input id="label" bind:value={eventLabel} />
    </div>

    <div class="form-group">
        <label for="startDate">Date de début</label>
        <input type="date" id="startDate" bind:value={eventStartDate} />
    </div>

    <div class="form-group">
        <label for="endDate">Date de fin</label>
        <input type="date" id="endDate" bind:value={eventEndDate} />
    </div>
</EditableForm>

<style>
    /* === Dates === */
    .event-dates {
        font-size: 0.95rem;
        color: #7f8c8d;
        margin-bottom: 1.5rem;
        text-align: center;
        transition: color 0.3s ease;
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
</style>
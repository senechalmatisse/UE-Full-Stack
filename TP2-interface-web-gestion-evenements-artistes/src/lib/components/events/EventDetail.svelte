<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import EditableForm from "$lib/components/shared/forms/EditableForm.svelte";
    import type { Event } from "$lib/types/pagination";
    import { createEventService } from "$lib/services/event.service";
    import { AppError } from "$lib/services/api.error";
    import { DateFormatterFactory } from "$lib/utils/formatters";
    import { DataValidator } from "$lib/utils/validation";

    /**
     * EventDetail Component
     *
     * This component displays detailed information about a single event
     * and allows editing its properties (label, start date, end date).
     *
     * Features:
     * - Editable form with client-side validation.
     * - Local state synchronization with updated event data.
     * - Uses `eventService` to persist changes to the backend.
     * - Dispatches an `updated` event to notify parent components.
     * - Shows formatted event dates using a localized French formatter.
     *
     * @example
     * <EventDetail
     *   event={event}
     *   on:updated={(event) => console.log("Event updated:", event.detail)}
     * />
     */

    /**
     * The event object containing current details.
     * Passed in as a prop and editable via the form.
     */
    export let event: Event;

    /** Service instance for performing API requests related to events. */
    const eventService = createEventService();

    /** Date formatter for displaying event dates in French format. */
    const frenchDateFormatter = DateFormatterFactory.getFrenchFormatter();

    /**
     * Dispatcher used to send custom events to parent components.
     * Supported event(s):
     * - `updated`: Fired when the event is successfully updated.
     */
    const dispatch = createEventDispatcher<{ updated: Event }>();

    /** Local editable state for the event label (name). */
    let eventLabel = event.label;

    /** Local editable state for the event start date. */
    let eventStartDate = event.startDate;

    /** Local editable state for the event end date. */
    let eventEndDate = event.endDate;

    /**
     * Validates the event form fields before submission.
     *
     * - Ensures the label has at least 3 characters.
     * - Validates that both start and end dates are valid.
     * - Ensures that the end date occurs after the start date.
     *
     * @throws {AppError} If validation fails.
     */
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

    /**
     * Saves the updated event information.
     *
     * - Runs validation before making API requests.
     * - Calls the API to update the event with sanitized inputs.
     * - Updates the local state with the new data.
     * - Dispatches an `updated` event to inform parent components.
     *
     * @throws {AppError} If validation fails or API update is unsuccessful.
     * @returns {Promise<Event>} The updated event object.
     */
    async function saveEvent() {
        validateForm();

        const updated = await eventService.update("/events", event.id, {
            label: DataValidator.sanitizeString(eventLabel),
            startDate: DataValidator.sanitizeString(eventStartDate),
            endDate: DataValidator.sanitizeString(eventEndDate),
        });

        if (!updated) throw new AppError(500, "Échec lors de la mise à jour de l'événement");

        // Local synchronization in a single assignment
        event = { ...event, ...updated };

        // Notify parent component
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
        Du <time datetime={event.startDate}>
            {frenchDateFormatter.format(event.startDate)}
        </time>
        au <time datetime={event.endDate}>
            {frenchDateFormatter.format(event.endDate)}
        </time>
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
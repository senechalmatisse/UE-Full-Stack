<script lang="ts">
	import type { Event } from "$lib/core";
	import { useEventDates, useEntityEditor } from "$lib/hooks";
	import { createEventService, getDataValidator } from "$lib/core";
	import EditableForm from "$lib/components/shared/forms/EditableForm.svelte";

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

    /** Injected validator instance. */
    const validator = getDataValidator();

	const { saveEntity } = useEntityEditor<Event>({
		entity: event,
		service: eventService,
		endpoint: "/events",
		minLabelLength: 3
	});

	const { formatEventDates, dateFormatter } = useEventDates();

	// Local state
    let eventLabel = event.label;
    let eventStartDate = event.startDate;
    let eventEndDate = event.endDate;

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
    async function saveEvent(): Promise<Event> {
		dateFormatter.validateRange(eventStartDate, eventEndDate);

        const updated = await saveEntity({
			label: validator.sanitizeString(eventLabel),
			startDate: validator.sanitizeString(eventStartDate),
			endDate: validator.sanitizeString(eventEndDate)
        });

        event = { ...event, ...updated };
        return event;
    }
</script>

<EditableForm
    title="Informations sur l’événement"
    onSave={saveEvent}
    successMessage="Événement mis à jour avec succès"
>
    <p class="event-dates">
        {formatEventDates(event)}
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
    @import "$lib/styles/forms/forms.base.css";
    @import "$lib/styles/forms/forms.fields.css";

    /* === Dates === */
    .event-dates {
        font-size: 0.95rem;
        color: #7f8c8d;
        margin-bottom: 1.5rem;
        text-align: center;
        transition: color 0.3s ease;
    }
</style>
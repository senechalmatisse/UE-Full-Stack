<script lang="ts">
    import type { Event } from "$lib/types/pagination";
    import { createEventService } from "$lib/services/event.service";
    import { getDataValidator } from "$lib/utils/validation/factories";
    import EditableForm from "$lib/components/shared/forms/EditableForm.svelte";
    import { useEntityEditor } from "$lib/hooks/useEntityEditor";
    import { useDateValidation } from "$lib/hooks/useDateValidation";
    import { useEventDates } from "$lib/hooks/useEventDates";

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

    /** Injected validator instance (no dépendance statique à getAppConfig). */
    const validator = getDataValidator();

    const { saveEntity, dispatch } = useEntityEditor<Event>({
        entity: event,
        service: eventService,
        endpoint: "/events",
        minLabelLength: 3
    });

    const { validateDateRange } = useDateValidation();
    const { formatEventDates, dateFormatter } = useEventDates();

    /** Local editable state for the event label (name). */
    let eventLabel = event.label;

    /** Local editable state for the event start date. */
    let eventStartDate = event.startDate;

    /** Local editable state for the event end date. */
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
    async function saveEvent() {
        validateDateRange(eventStartDate, eventEndDate);

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
<script lang="ts">
    import { onMount } from 'svelte';
    import { useAssociation } from '$lib/hooks';
    import { AppError } from '$lib/core';

    /**
     * Represents a single association item displayed in the list.
     */
    type Item = { 
        /** Unique identifier for the item */
        id: string; 

        /** Human-readable label for the item */
        label: string; 
    };

    /**
     * Defines all user-facing messages required for confirmation, success, and error feedback.
     */
    type AssociationMessages = {
        /** Confirmation message shown before adding an item */
        confirmAdd: string;

        /** Confirmation message shown before removing an item */
        confirmRemove: string;

        /** Success message displayed when an item is successfully added */
        successAdd: string;

        /** Success message displayed when an item is successfully removed */
        successRemove: string;

        /** Error message displayed when adding an item fails */
        errorAdd: string;

        /** Error message displayed when removing an item fails */
        errorRemove: string;
    };

    /** Section title displayed above the association list */
    export let title: string;

    /** Label displayed when the list is empty */
    export let emptyLabel: string;

    /** Label for the select field used to add a new item */
    export let inputLabel: string;

    /** Placeholder text for the select field */
    export let inputPlaceholder: string;

    /** Object containing all feedback and confirmation messages */
    export let messages: AssociationMessages;

    /** Current list of associated items */
    export let items: Item[] = [];

    /**
     * Callback executed when adding a new item.
     * @param id - The identifier of the item to add.
     * @returns The newly added item.
     */
    export let onAdd: (id: string) => Promise<Item>;

    /**
     * Callback executed when removing an item.
     * @param item - The item to remove.
     */
    export let onRemove: (item: Item) => Promise<void>;

    /**
     * Callback to fetch all available items for selection.
     * @returns A list of all items that can be associated.
     */
    export let onFetchAvailable: () => Promise<Item[]>;

    /** Local state: selected item ID from the dropdown */
    let selectedId = '';

    /** Local state: list of available items to select from */
    let availableItems: Item[] = [];

    /** Local state: filtered list excluding already associated items */
    let selectableItems: Item[] = [];

    /** Hook that provides loading state and add/remove entity logic */
    const { isLoading, addEntity, removeEntity } = useAssociation<Item>();

    /**
     * Fetch available items on component mount
     */
    onMount(async () => {
        try {
            availableItems = await onFetchAvailable();
            updateSelectableItems();
        } catch (err) {
            console.error('Failed to fetch available items:', err);
        }
    });

    /**
     * Update the list of selectable items by excluding already associated ones
     */
    function updateSelectableItems() {
        const associatedIds = new Set(items.map(item => item.id));
        selectableItems = availableItems.filter(item => !associatedIds.has(item.id));
    }

    /**
     * Reactively update selectable items when associated items change
     */
    $: if (availableItems.length > 0) {
        updateSelectableItems();
    }

    /**
     * Handles form submission for adding a new item.
     */
    async function handleAdd() {
        const id = selectedId.trim();
        if (!id) return;

        await addEntity(
            messages.confirmAdd,
            async () => {
                const item = await onAdd(id);
                if (!item) throw new AppError(500, messages.errorAdd);
                selectedId = '';
                return item;
            },
            (item: any) => (items = [...items, item]),
            messages.successAdd,
            messages.errorAdd
        );
    }

    /**
     * Handles removing an existing item from the list.
     */
    async function handleRemove(item: Item) {
        await removeEntity(
            messages.confirmRemove,
            () => onRemove(item),
            () => (items = items.filter(i => i.id !== item.id)),
            item,
            messages.successRemove,
            messages.errorRemove
        );
    }
</script>

<section class="association-container">
    <h2 class="association-title">{title}</h2>

    {#if items.length === 0}
        <p class="association-empty">{emptyLabel}</p>
    {:else}
        <ul class="association-list">
            {#each items as item (item.id)}
                <li class="association-item" id={`item-${item.id}`}>
                    <span class="association-label">{item.label}</span>
                    <button
                        class="association-remove-btn"
                        on:click={() => handleRemove(item)}
                        disabled={$isLoading}
                        aria-label={`Supprimer ${item.label}`}
                    >
                        Supprimer
                    </button>
                </li>
            {/each}
        </ul>
    {/if}

    <form class="association-form" on:submit|preventDefault={handleAdd}>
        <label for="newId" class="association-form-label">{inputLabel}</label>
        {#if selectableItems.length === 0}
            <p class="association-no-items">Aucun élément disponible à associer</p>
        {:else}
            <select
                id="newId"
                class="association-form-select"
                bind:value={selectedId}
                required
            >
                <option value="" disabled selected>{inputPlaceholder}</option>
                {#each selectableItems as item (item.id)}
                    <option value={item.id}>{item.label}</option>
                {/each}
            </select>
            <button
                type="submit"
                class="association-form-submit"
                disabled={$isLoading || !selectedId}
            >
                Ajouter
            </button>
        {/if}
    </form>
</section>

<style>
    /* === Container === */
    .association-container {
        background-color: #fdfdfd;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        margin: 2rem auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease, opacity 0.3s ease;
    }

    /* === Heading === */
    .association-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: #2c3e50;
        text-align: center;
    }

    /* === List === */
    .association-list {
        list-style: none;
        padding: 0;
        margin-bottom: 1.5rem;
    }

    .association-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        transition: background-color 0.3s ease;
    }

    .association-item:hover {
        background-color: #eef2f5;
    }

    .association-label {
        font-weight: 500;
        color: #2c3e50;
    }

    /* === Empty State === */
    .association-empty {
        font-size: 0.95rem;
        color: #7f8c8d;
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .association-no-items {
        font-size: 0.95rem;
        color: #7f8c8d;
        text-align: center;
        font-style: italic;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 6px;
    }

    /* === Form === */
    .association-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: opacity 0.3s ease;
    }

    .association-form-label {
        font-weight: 500;
        color: #34495e;
    }

    .association-form-select {
        padding: 0.6rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        background-color: white;
        cursor: pointer;
    }

    .association-form-select:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
    }

    .association-form-select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: #f5f5f5;
    }

    /* === Buttons === */
    .association-remove-btn,
    .association-form-submit {
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .association-remove-btn {
        padding: 0.6rem 1rem;
        margin-left: 1rem;
    }

    .association-form-submit {
        padding: 0.75rem 1.25rem;
        align-self: flex-start;
    }

    .association-remove-btn:hover:not(:disabled),
    .association-form-submit:hover:not(:disabled) {
        background-color: #2980b9;
    }

    .association-remove-btn:disabled,
    .association-form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
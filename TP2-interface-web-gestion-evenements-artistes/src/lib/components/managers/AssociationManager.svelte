<script lang="ts">
    import { useAssociation } from '$lib/hooks/useAssociation';
    import { AppError } from '$lib/services/api.error';

    type Item = { id: string; label: string };

    export let title: string;
    export let emptyLabel: string;
    export let inputLabel: string;
    export let inputPlaceholder: string;
    export let confirmAddMsg: string;
    export let confirmRemoveMsg: string;
    export let successAddMsg: string;
    export let successRemoveMsg: string;
    export let errorAddMsg: string;
    export let errorRemoveMsg: string;

    export let items: Item[];
    export let onAdd: (id: string) => Promise<Item>;
    export let onRemove: (item: Item) => Promise<void>;

    let newId = '';
    const { isLoading, addEntity, removeEntity } = useAssociation<Item>();

    function addToList(item: Item) {
        items = [...items, item];
    }

    function removeFromList(item: Item) {
        items = items.filter(i => i.id !== item.id);
    }

    async function handleAdd() {
        const id = newId.trim();
        if (!id) return;

        await addEntity(
            confirmAddMsg,
            async () => {
                const item = await onAdd(id);
                if (!item) throw new AppError(500, errorAddMsg);
                newId = '';
                return item;
            },
            addToList,
            successAddMsg,
            errorAddMsg
        );
    }

    async function handleRemove(item: Item) {
        await removeEntity(
            confirmRemoveMsg,
            () => onRemove(item),
            removeFromList,
            item,
            successRemoveMsg,
            errorRemoveMsg
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
        <input
            id="newId"
            class="association-form-input"
            placeholder={inputPlaceholder}
            bind:value={newId}
            required
            autocomplete="off"
        />
        <button type="submit" class="association-form-submit" disabled={$isLoading}>
            Ajouter
        </button>
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

    /* === Artist List === */
    #association-list {
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

    .association-form-input {
        padding: 0.6rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .association-form-input:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
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
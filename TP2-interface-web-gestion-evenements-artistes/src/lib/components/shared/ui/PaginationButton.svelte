<script lang="ts">
    /**
     * PaginationButton component
     *
     * This component represents an individual button in a pagination system.
     * It supports accessibility features, active state highlighting,
     * loading/disabled states, and custom styling.
     *
     * @example
     * <PaginationButton
     *   page={1}
     *   isActive={true}
     *   ariaLabel="Page 1"
     *   onClick={(page) => console.log('Go to page:', page)}
     * />
     */

    /**
     * Target page number represented by this button.
     * This is passed back when the button is clicked.
     */
    export let page!: number;

    /**
     * Marks the button as active (highlighted).
     * Typically used to indicate the current page.
     */
    export let isActive = false;

    /**
     * Indicates whether the button should be disabled while loading.
     * Prevents user interaction until loading finishes.
     */
    export let isLoading = false;

    /**
     * Additional disable flag.
     * Can be used to disable the button explicitly regardless of other states.
     */
    export let disabled = false;


    /** Accessibility label for screen readers. */
    export let ariaLabel: string;

    /**
     * Callback function invoked when the button is clicked.
     * @param page - The page number assigned to this button.
     */
    export let onClick!: (page: number) => void;

    /** Optional additional CSS class string to customize button style. */
    export let extraClass: string = "";

    /**
     * Handles keyboard interaction for accessibility.
     * Supports "Enter" and "Space" keys as activation triggers.
     */
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(page);
        }
    }
</script>

<button
    class={`pagination-btn ${extraClass} ${isActive ? 'active' : ''}`}
    on:click={() => onClick(page)}
    on:keydown={handleKeydown}
    disabled={disabled || isLoading || isActive}
    aria-label={ariaLabel}
    aria-current={isActive ? 'page' : undefined}
>
    <slot>{page}</slot>
</button>

<style>
   /* Page buttons */
    .pagination-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        border: none;
        border-radius: 6px;
        background-color: #ecf0f1;
        color: #2c3e50;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled) {
        background-color: #95a5a6;
        transform: translateY(-1px), scale(0.97);
    }

    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-btn:focus {
        outline: 2px solid #3498db;
        outline-offset: 2px;
    }

    /* Active page */
    .pagination-btn.active {
        background-color: #3498db;
        color: white;
        font-weight: 600;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    .pagination-btn:focus-visible {
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.4);
    }
    /* Previous / Next buttons */
    .pagination-btn.prev,
    .pagination-btn.next {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.4em;
    }
</style>
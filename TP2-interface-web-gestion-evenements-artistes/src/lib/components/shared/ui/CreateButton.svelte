<script lang="ts">
	import { goto } from '$app/navigation';

	/**
	 * URL de destination pour la création
	 */
	export let href: string;

	/**
	 * Libellé du bouton
	 */
	export let label: string;

	/**
	 * Icône à afficher (par défaut : +)
	 */
	export let icon: string = '+';

	/**
	 * Gère le clic sur le bouton
	 */
	function handleClick() {
		goto(href);
	}
</script>

<button
	on:click={handleClick}
	id="create-button"
	aria-label={label}
>
	<span class="icon" aria-hidden="true">{icon}</span>
	<span class="label">{label}</span>
</button>

<style>
	#create-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #fff;
        background: var(--accent);
        text-decoration: none;
        border-radius: 8px;
        transition: 0.2s ease;
        transform: translateY(-1px);
	}

    #create-button:hover,
    #create-button:focus-visible {
		background: var(--accent-700);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        outline: 2px solid var(--accent);
        outline-offset: 3px;
	}

	.icon {
		font-size: 1.25rem;
		line-height: 1;
		font-weight: 300;
	}

	@media (max-width: 640px) {
		#create-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
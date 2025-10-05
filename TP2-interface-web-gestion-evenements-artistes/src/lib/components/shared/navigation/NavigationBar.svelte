<script lang="ts">
    import { page } from '$app/stores';
    import { onMount, afterUpdate } from 'svelte';
    import { useNavigation, useUnderlineAnimation } from '$lib/hooks';

    // Configuration
    const links = [
        { name: 'Artistes', href: '/artists' },
        { name: 'Événements', href: '/events' }
    ];

	let activeHref = '';
	const { buildHref } = useNavigation();

	// Composable underline
	const { underlineState, updatePosition, setupResizeListener } = useUnderlineAnimation();

	/** Event Handlers */
	function handleMouseEnter(event: MouseEvent): void {
		updatePosition(event.currentTarget as HTMLElement);
	}

	function handleMouseLeave(): void {
		updatePosition();
	}

	/** Lifecycle */
	onMount(() => {
		activeHref = window.location.pathname;
		updatePosition();
        return setupResizeListener(() => updatePosition());
	});

	afterUpdate(() => {
		const current = window.location.pathname;
		if (current !== activeHref) {
			activeHref = current;
			updatePosition();
		}
	});
</script>

<nav class="navbar" aria-label="Navigation principale">
    <div class="nav-links" role="navigation" on:mouseleave={handleMouseLeave}>
        {#each links as { name, href }}
			<a
                href={buildHref(href)}
				class:active={$page.url.pathname === href}
				on:mouseenter={handleMouseEnter}
            >
                {name}
            </a>
        {/each}
        <div
            class="underline"
            style="width:{$underlineState.width}px; transform:translateX({$underlineState.x}px);"
        ></div>
    </div>
</nav>

<style>
.navbar {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1rem 0;
	background-color: #fff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-links {
	position: relative;
	display: flex;
	gap: 3rem;
	align-items: center;
}

.nav-links a {
	position: relative;
	color: #555;
	text-decoration: none;
	font-weight: 500;
	padding-bottom: 4px;
	transition: color 0.3s ease;
	cursor: pointer;
}

.nav-links a:hover {
	color: #0077ff;
}

.nav-links a.active {
	color: #0077ff;
}

.underline {
	position: absolute;
	bottom: 0;
	height: 2px;
	background-color: #0077ff;
	border-radius: 2px;
	transition: transform 0.3s ease, width 0.3s ease;
	will-change: transform, width;
}
</style>
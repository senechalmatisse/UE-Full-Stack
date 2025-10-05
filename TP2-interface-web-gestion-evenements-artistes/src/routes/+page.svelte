<script lang="ts">
/**
 * @file Home Page Component
 * @component HomePage
 * @description
 * The **HomePage** component serves as the main entry point (root route) of the application.
 * It provides a clear, responsive, and accessible interface for users to discover
 * the app’s core functionality — managing events and artists.
 *
 * @remarks
 * It uses:
 * - Native HTML elements and semantic structure.
 * - Svelte built-in transitions for lightweight animations.
 *
 * It is designed as a *static landing page*, but can easily be extended
 * to display dynamic content via configuration or API integration.
 *
 * @responsibilities
 * - Display the main hero section (title and subtitle).
 * - Present feature cards describing the app’s key capabilities.
 * - Serve as a navigational entry point for “Events” and “Artists” routes.
 *
 * @accessibility
 * - Uses semantic HTML5 structure for screen readers.
 * - Headings follow a logical hierarchy (`h1`, `h2`, `h3`).
 * - Buttons and regions are labeled with `aria-label` when needed.
 */

import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { fade, fly } from 'svelte/transition';

/**
 * Static title of the home page.
 *
 * @constant
 * @type {string}
 * @default
 */
const TITLE: string = 'Gestionnaire d’Événements et d’Artistes';

/**
 * Static subtitle displayed below the main title.
 *
 * @constant
 * @type {string}
 * @default
 */
const SUBTITLE: string = 'Gérez facilement les événements, les artistes et leurs relations.';
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta
        name="description"
        content="Interface pour gérer les événements et les artistes. Parcourez des listes paginées, consultez les détails et gérez les relations."
    />
</svelte:head>

<main id="home-page" class="container" in:fade={{ duration: 400 }}>
	<section
        id="home-hero"
        class="hero"
        in:fly={{ y: -10, duration: 450 }}
		aria-labelledby="hero-title"
    >
		<h1 id="hero-title" class="hero-title">{TITLE}</h1>
		<p id="hero-subtitle" class="hero-subtitle">{SUBTITLE}</p>
	</section>

	<section
        id="features-section"
        class="features"
        in:fade={{ delay: 120, duration: 400 }}
		aria-labelledby="features-title"
    >
		<h2 id="features-title" class="sr-only">Fonctionnalités</h2>

		<div id="features-grid" class="features-grid" role="list">
			<article id="feature-events" class="feature-card" role="listitem">
				<h3 class="feature-title">Gestion des événements</h3>
				<p class="feature-desc">
					Parcourez les événements paginés, modifiez leurs détails (dates, titre)
                    et gérez les artistes participants.
				</p>
			</article>

			<article id="feature-artists" class="feature-card" role="listitem">
				<h3 class="feature-title">Répertoire des artistes</h3>
				<p class="feature-desc">
					Recherchez et parcourez les artistes, consultez leurs participations
                    et mettez à jour leurs informations.
				</p>
			</article>
		</div>
	</section>
</main>

<style>
	/* === MAIN CONTAINER === */
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
		box-sizing: border-box;
	}

	/* === HERO SECTION === */
	#home-hero.hero {
		text-align: center;
		padding: 3rem 1rem;
		border-radius: 12px;
		background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
		box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
	}

	.hero-title {
		font-size: 2.5rem;
		line-height: 1.05;
		margin: 0 0 0.75rem 0;
		color: #0f172a;
		font-weight: 700;
	}

	.hero-subtitle {
		margin: 0 0 1.5rem 0;
		color: #475569;
		font-size: 1.05rem;
		max-width: 70ch;
		margin-left: auto;
		margin-right: auto;
	}

	/* === FEATURES SECTION === */
	#features-section.features {
		margin-top: 2rem;
		padding: 1.5rem 0 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
		align-items: stretch;
	}

	.feature-card {
		background: #fff;
		border-radius: 10px;
		padding: 1.25rem;
		box-shadow: 0 6px 16px rgba(2, 6, 23, 0.04);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.feature-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
		color: #0f172a;
	}

	.feature-desc {
		color: #475569;
		margin: 0 0 1rem 0;
		font-size: 0.95rem;
	}

	/* === RESPONSIVENESS (Small Screens) === */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 1.9rem;
		}
		.features-grid {
			grid-template-columns: 1fr;
		}
		.container {
			padding: 1rem;
		}
	}
</style>
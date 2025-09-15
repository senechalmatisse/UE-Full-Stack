<script lang="ts">
  /**
   * Error page component for the /events route.
   *
   * Responsibilities:
   * - Displays a user-friendly error message when an error occurs while
   *   loading event data (e.g., network error, server error, or 404 not found).
   *
   * Props:
   * @prop {Error | null} error - The error object thrown during page load.
   * @prop {number | null} status - HTTP status code associated with the error.
   *
   * Behavior:
   * - Shows the error message if available; otherwise displays a fallback message.
   * - Displays custom messages for 404 and 500 HTTP status codes.
   */
  export let error: Error | null;
  export let status: number | null;
</script>

<section class="error-page">
  <h1>{status ?? 'Erreur'}</h1>
  <p>{error?.message || 'Une erreur est survenue.'}</p>

  {#if status === 404}
    <p>La ressource demandée est introuvable.</p>
  {:else if status === 500}
    <p>Impossible de charger les détails de l’événement.</p>
  {/if}

  <a href="/" class="back-home">⬅ Retour à l’accueil</a>
</section>

<style>
.error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
    gap: 1rem;
}

h1 {
    font-size: 4rem;
    color: crimson;
}

.back-home {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: crimson;
    color: white;
    border-radius: 6px;
    text-decoration: none;
}
</style>
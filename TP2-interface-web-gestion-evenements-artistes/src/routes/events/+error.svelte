<script>
  export let error;
  export let status;
  console.log('Erreur capturée par +error.svelte:', { error, status });
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
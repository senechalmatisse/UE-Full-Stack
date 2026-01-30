import { Backdrop, CircularProgress } from '@mui/material';
import { useAppContext } from '../context';

/**
 * Composant d'interface utilisateur dédié à la restitution visuelle des états d'attente.
 * <p>
 * Ce module a pour fonction d'informer l'utilisateur qu'un traitement asynchrone est en cours d'exécution
 * (chargement de données, soumission de formulaire). Il implémente un mécanisme de "feedback" bloquant
 * via l'utilisation d'un fond grisé (Backdrop) recouvrant l'intégralité de la vue courante,
 * au centre duquel s'anime un indicateur de progression circulaire.
 * </p>
 * <p>
 * Sur le plan architectural, ce composant agit comme un consommateur passif du contexte global de l'application.
 * Il s'abonne aux changements d'état de la variable `loading` via le hook {@link useAppContext}.
 * Cette centralisation permet de piloter l'affichage du chargement depuis n'importe quel composant enfant,
 * garantissant une expérience utilisateur cohérente sans duplication de code d'interface.
 * </p>
 *
 * @returns L'élément JSX de chargement si l'état est actif, ou `null` pour un rendu invisible.
 */
const Loader = () => {
    const { loading } = useAppContext();

    return loading ? (
        <Backdrop open={true} sx={{ color: '#FFF' }}>
            <CircularProgress color="inherit" />
        </Backdrop>
    ) : null;
};

export default Loader;
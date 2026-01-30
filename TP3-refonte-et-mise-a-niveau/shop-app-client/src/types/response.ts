/**
 * Contrat d'interface générique standardisant les réponses d'API paginées.
 * <p>
 * Ce type utilitaire modélise la structure de données renvoyée par les points de terminaison (endpoints)
 * du backend Spring Boot lorsqu'ils restituent des collections d'objets (comme les listes de produits,
 * de boutiques ou de catégories). Il encapsule non seulement le statut HTTP de la transaction,
 * mais surtout la charge utile (payload) formatée selon le standard <code>Page</code> de Spring Data.
 * </p>
 * <p>
 * L'architecture de cette interface est essentielle pour le fonctionnement des composants de navigation :
 * elle fournit à la fois le contenu métier (champ <code>content</code>) et l'ensemble des métadonnées techniques
 * nécessaires au pilotage de l'interface utilisateur. En effet, des propriétés telles que <code>totalPages</code>
 * ou <code>number</code> (index de page courant) sont directement consommées par le composant de pagination
 * pour calculer les sauts de page et afficher l'état de la navigation, tandis que le paramètre générique <code>T</code>
 * assure un typage fort et réutilisable pour toutes les entités du domaine.
 * </p>
 */
export type ResponseArray<T> = {
    status: number;
    data: {
        content: T[];
        pageable: {
            sort: {
                empty: boolean;
                sorted: boolean;
                unsorted: boolean;
            };
            offset: number;
            pageNumber: number;
            pageSize: number;
            paged: boolean;
            unpaged: boolean;
        };
        last: boolean;
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        first: boolean;
        numberOfElements: number;
        empty: boolean;
    };
};
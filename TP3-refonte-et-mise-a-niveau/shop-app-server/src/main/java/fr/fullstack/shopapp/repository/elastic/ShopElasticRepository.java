package fr.fullstack.shopapp.repository.elastic;

import fr.fullstack.shopapp.model.Shop;
import org.springframework.data.domain.*;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import java.time.LocalDate;

/**
 * Interface de persistance dédiée à l'interaction avec le moteur d'indexation Elasticsearch pour l'entité {@link Shop}.
 */
public interface ShopElasticRepository extends ElasticsearchRepository<Shop, Long> {

    /**
     * Exécute une requête de recherche multicritère complexe sur l'index des boutiques.
     *
     * @param name        La sous-chaîne de caractères à rechercher dans le nom de la boutique (clause "containing").
     * @param after       La date de création minimale (clause "greater than").
     * @param before      La date de création maximale (clause "less than").
     * @param inVacations Le statut de congé attendu (clause "term match").
     * @param pageable    Les paramètres de pagination et de tri de la requête.
     * @return Une {@link Page} contenant les boutiques correspondant à l'intersection de tous ces critères.
     */
    Page<Shop> findAllByNameContainingAndCreatedAtAfterAndCreatedAtBeforeAndInVacationsEquals(
        String name, 
        LocalDate after, 
        LocalDate before, 
        Boolean inVacations, 
        Pageable pageable
    );
}
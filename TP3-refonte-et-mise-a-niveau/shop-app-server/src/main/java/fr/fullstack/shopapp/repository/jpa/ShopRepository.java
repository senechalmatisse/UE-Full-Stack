package fr.fullstack.shopapp.repository.jpa;

import fr.fullstack.shopapp.model.Shop;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

import java.time.LocalDate;

/**
 * Interface de persistance responsable de l'accès aux données de l'entité {@link Shop}.
 */
public interface ShopRepository extends JpaRepository<Shop, Long> {

    /**
     * Recherche les boutiques créées à l'intérieur d'une plage de dates définie.
     *
     * @param dateStart La date de début de la période (incluse).
     * @param dateEnd   La date de fin de la période (incluse).
     * @param pageable  Les paramètres de pagination.
     * @return Une page de boutiques dont la date de création est comprise dans l'intervalle.
     */
    Page<Shop> findByCreatedAtBetween(LocalDate dateStart, LocalDate dateEnd, Pageable pageable);

    /**
     * Sélectionne les boutiques créées postérieurement à une date de référence.
     *
     * @param date     La date pivot.
     * @param pageable Les paramètres de pagination.
     * @return Une page contenant les boutiques les plus récentes.
     */
    Page<Shop> findByCreatedAtGreaterThan(LocalDate date, Pageable pageable);

    /**
     * Sélectionne les boutiques créées antérieurement à une date de référence.
     *
     * @param date     La date pivot.
     * @param pageable Les paramètres de pagination.
     * @return Une page contenant les boutiques les plus anciennes.
     */
    Page<Shop> findByCreatedAtLessThan(LocalDate date, Pageable pageable);

    /**
     * Filtre les boutiques selon leur statut d'ouverture actuel (en congés ou non).
     *
     * @param inVacations L'état recherché (true pour les boutiques en congés).
     * @param pageable    Les paramètres de pagination.
     * @return Une page de boutiques correspondant au statut demandé.
     */
    Page<Shop> findByInVacations(boolean inVacations, Pageable pageable);

    /**
     * Combine le filtre de statut avec une condition d'antériorité minimale.
     *
     * @param inVacations L'état de congés recherché.
     * @param date        La date de création plancher.
     * @param pageable    Les paramètres de pagination.
     * @return Une page de résultats filtrée.
     */
    Page<Shop> findByInVacationsAndCreatedAtGreaterThan(boolean inVacations, LocalDate date, Pageable pageable);

    /**
     * Applique un filtrage multicritère combinant statut et fenêtre temporelle stricte.
     *
     * @param inVacations L'état de congés.
     * @param dateStart   Début de la période de création.
     * @param dateEnd     Fin de la période de création.
     * @param pageable    Les paramètres de pagination.
     * @return Une page de résultats correspondant à l'intersection des critères.
     */
    Page<Shop> findByInVacationsAndCreatedAtGreaterThanAndCreatedAtLessThan(
            boolean inVacations, LocalDate dateStart,
            LocalDate dateEnd, Pageable pageable
    );

    /**
     * Combine le filtre de statut avec une condition d'antériorité maximale.
     *
     * @param inVacations L'état de congés recherché.
     * @param date        La date de création plafond.
     * @param pageable    Les paramètres de pagination.
     * @return Une page de résultats filtrée.
     */
    Page<Shop> findByInVacationsAndCreatedAtLessThan(boolean inVacations, LocalDate date, Pageable pageable);

    /**
     * Retourne l'ensemble des boutiques triées par date de création croissante (les plus anciennes d'abord).
     *
     * @param pageable Les paramètres de pagination.
     * @return Une page de boutiques ordonnée chronologiquement.
     */
    Page<Shop> findByOrderByCreatedAtAsc(Pageable pageable);

    /**
     * Retourne l'ensemble des boutiques triées par identifiant technique croissant.
     *
     * @param pageable Les paramètres de pagination.
     * @return Une page de boutiques ordonnée par ID.
     */
    Page<Shop> findByOrderByIdAsc(Pageable pageable);

    /**
     * Retourne l'ensemble des boutiques triées par ordre alphabétique du nom.
     *
     * @param pageable Les paramètres de pagination.
     * @return Une page de boutiques ordonnée alphabétiquement.
     */
    Page<Shop> findByOrderByNameAsc(Pageable pageable);

    /**
     * Exécute un tri complexe basé sur la volumétrie du catalogue (nombre de produits).
     *
     * @param pageable Les paramètres de pagination.
     * @return Une page de boutiques triée par nombre de produits décroissant (selon la clause ORDER BY de la requête).
     */
    @Query(
            value = "SELECT *,"
                    + "(SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) as nbProducts, "
                    + "(SELECT COUNT(DISTINCT pc.category_id) FROM products_categories pc WHERE pc.product_id IN "
                    + "(SELECT p.id FROM products p WHERE p.shop_id = s.id)) as nbCategories "
                    + "FROM shops s "
                    + "ORDER BY (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) DESC",
            countQuery = "SELECT * "
                    + "FROM shops s "
                    + "ORDER BY (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) DESC",
            nativeQuery = true
    )
    Page<Shop> findByOrderByNbProductsAsc(Pageable pageable);
}
package fr.fullstack.shopapp.repository.jpa;

import fr.fullstack.shopapp.model.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

/**
 * Interface de persistance responsable de la gestion des données de l'entité {@link Product}.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Récupère l'intégralité du catalogue produit avec une pagination stable.
     *
     * @param pageable Les paramètres de pagination (page, taille).
     * @return Une {@link Page} contenant la liste ordonnée des produits.
     */
    Page<Product> findByOrderByIdAsc(Pageable pageable);

    /**
     * Sélectionne les produits rattachés à une boutique spécifique.
     *
     * @param shopId   L'identifiant unique de la boutique propriétaire.
     * @param pageable Les paramètres de pagination à appliquer au sous-ensemble de résultats.
     * @return Une page de produits filtrée par boutique.
     */
    @Query(value = "SELECT * FROM Products WHERE shop_id = ?1", nativeQuery = true)
    Page<Product> findByShop(Long shopId, Pageable pageable);

    /**
     * Opère un filtrage croisé pour récupérer les produits d'une boutique appartenant à une catégorie donnée.
     *
     * @param shopId     L'identifiant de la boutique.
     * @param categoryId L'identifiant de la catégorie recherchée.
     * @param pageable   Les informations de pagination.
     * @return Une page de produits correspondant à l'intersection des deux critères.
     */
    @Query(value = "SELECT * FROM Products p WHERE p.shop_id = ?1 AND p.id IN (SELECT pc.product_id FROM "
            + "products_categories pc WHERE pc.category_id = ?2)",
           nativeQuery = true)
    Page<Product> findByShopAndCategory(Long shopId, Long categoryId, Pageable pageable);
}
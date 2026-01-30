package fr.fullstack.shopapp.repository.jpa;

import fr.fullstack.shopapp.model.Category;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Interface de persistance gérant l'accès aux données de l'entité {@link Category}.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Récupère l'ensemble des catégories sous forme paginée avec un tri déterministe.
     *
     * @param pageable Les informations de pagination (numéro de page, taille).
     * @return Une {@link Page} contenant les catégories triées par identifiant croissant.
     */
    Page<Category> findByOrderByIdAsc(Pageable pageable);
}
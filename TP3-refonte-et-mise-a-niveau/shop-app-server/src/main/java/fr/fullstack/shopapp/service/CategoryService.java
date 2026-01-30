package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.model.*;
import fr.fullstack.shopapp.repository.jpa.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.*;
import java.util.*;

/**
 * Couche de service responsable de l'encapsulation de la logique métier relative aux catégories.
 */
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Gestionnaire d'entités JPA injecté pour permettre des interactions directes avec le contexte de persistance.
     */
    @PersistenceContext
    private EntityManager em;

    /**
     * Assure la persistance d'une nouvelle catégorie dans le système.
     *
     * @param category L'objet catégorie à persister.
     * @return L'instance de la catégorie telle qu'enregistrée en base de données.
     * @throws Exception Si une erreur technique survient lors de la persistance.
     */
    public Category createCategory(Category category) throws Exception {
        try {
            return categoryRepository.save(category);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Orchestre la suppression sécurisée d'une catégorie par son identifiant.
     *
     * @param id L'identifiant unique de la catégorie à supprimer.
     * @throws Exception Si la catégorie n'existe pas ou si une erreur survient lors du traitement.
     */
    @Transactional
    public void deleteCategoryById(long id) throws Exception {
        try {
            Category category = getCategory(id);
            deleteNestedRelations(category);
            categoryRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Récupère l'instance d'une catégorie spécifique.
     *
     * @param id L'identifiant de la catégorie recherchée.
     * @return L'objet catégorie correspondant.
     * @throws Exception Si aucune catégorie n'est associée à cet identifiant.
     */
    public Category getCategoryById(long id) throws Exception {
        try {
            return getCategory(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Restitue l'ensemble des catégories sous forme paginée.
     *
     * @param pageable Les paramètres de pagination demandés.
     * @return Une page contenant la liste des catégories ordonnée.
     */
    public Page<Category> getCategoryList(Pageable pageable) {
        return categoryRepository.findByOrderByIdAsc(pageable);
    }

    /**
     * Gère la mise à jour des informations d'une catégorie existante.
     *
     * @param category L'objet catégorie contenant les nouvelles données.
     * @return La catégorie mise à jour.
     * @throws Exception Si la catégorie cible n'est pas trouvée.
     */
    public Category updateCategory(Category category) throws Exception {
        try {
            getCategory(category.getId());
            return this.createCategory(category);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Traite le déliement des associations entre la catégorie cible et les produits liés.
     *
     * @param category La catégorie en cours de suppression.
     */
    private void deleteNestedRelations(Category category) {
        List<Product> products = category.getProducts();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            List<Category> categories = product.getCategories();
            categories.remove(category);
            product.setCategories(categories);
            em.merge(product);
            em.flush();
        }
    }

    /**
     * Méthode utilitaire interne pour la récupération sécurisée d'une catégorie.
     *
     * @param id L'identifiant de la catégorie.
     * @return L'objet catégorie déballé.
     * @throws Exception Si la catégorie est introuvable.
     */
    private Category getCategory(Long id) throws Exception {
        Optional<Category> category = categoryRepository.findById(id);
        if (!category.isPresent()) throw new Exception("Category with id " + id + " not found");
        return category.get();
    }
}
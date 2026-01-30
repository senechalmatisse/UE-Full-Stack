package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.model.*;
import fr.fullstack.shopapp.repository.jpa.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.*;
import java.util.Optional;

/**
 * Service métier responsable de la gestion du cycle de vie des produits.
 */
@Service
public class ProductService {

    /**
     * Gestionnaire d'entités JPA injecté.
     */
    @PersistenceContext
    private EntityManager em;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Assure la persistance d'un nouveau produit dans le système.
     *
     * @param product L'entité produit à créer.
     * @return Le produit persisté et rafraîchi depuis la base de données.
     * @throws Exception Si la validation échoue ou si une erreur de persistance survient.
     */
    @Transactional
    public Product createProduct(Product product) throws Exception {
        try {
            checkLocalizedProducts(product);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }

        try {
            Product newProduct = productRepository.save(product);
            em.flush();
            em.refresh(newProduct);
            return newProduct;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Orchestre la suppression physique d'un produit.
     *
     * @param id L'identifiant unique du produit à supprimer.
     * @throws Exception Si le produit n'est pas trouvé.
     */
    public void deleteProductById(long id) throws Exception {
        try {
            getProduct(id);
            productRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Permet la consultation unitaire d'un produit.
     *
     * @param id L'identifiant du produit recherché.
     * @return L'instance du produit.
     * @throws Exception Si aucun produit ne correspond à l'identifiant fourni.
     */
    public Product getProductById(long id) throws Exception {
        try {
            return getProduct(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Restitue le catalogue de produits en appliquant une stratégie de filtrage dynamique.
     *
     * @param shopId     (Optionnel) L'identifiant de la boutique pour le filtrage.
     * @param categoryId (Optionnel) L'identifiant de la catégorie pour le filtrage.
     * @param pageable   Les paramètres de pagination.
     * @return Une page de produits correspondant aux critères les plus restrictifs appliqués.
     */
    public Page<Product> getShopProductList(Optional<Long> shopId, Optional<Long> categoryId, Pageable pageable) {
        if (shopId.isPresent() && categoryId.isPresent()) {
            return productRepository.findByShopAndCategory(shopId.get(), categoryId.get(), pageable);
        }

        if (shopId.isPresent()) return productRepository.findByShop(shopId.get(), pageable);

        return productRepository.findByOrderByIdAsc(pageable);
    }

    /**
     * Gère la mise à jour des informations d'un produit existant.
     *
     * @param product L'objet produit contenant les modifications.
     * @return Le produit mis à jour.
     * @throws Exception Si le produit cible n'existe pas ou si la validation échoue.
     */
    @Transactional
    public Product updateProduct(Product product) throws Exception {
        try {
            getProduct(product.getId());
            return this.createProduct(product);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Valide la conformité des données de localisation associées au produit.
     *
     * @param product Le produit à valider.
     * @throws Exception Si aucune version française n'est détectée.
     */
    private void checkLocalizedProducts(Product product) throws Exception {
        Optional<LocalizedProduct> localizedProductFr = product.getLocalizedProducts()
                .stream().filter(o -> o.getLocale().equals("FR")).findFirst();

        if (!localizedProductFr.isPresent()) {
            throw new Exception("A name in french must be at least provided");
        }
    }

    /**
     * Méthode utilitaire interne pour la récupération sécurisée d'un produit.
     *
     * @param id L'identifiant du produit.
     * @return L'instance du produit si elle existe.
     * @throws Exception Si le produit est introuvable.
     */
    private Product getProduct(Long id) throws Exception {
        Optional<Product> product = productRepository.findById(id);
        if (!product.isPresent()) throw new Exception("Product with id " + id + " not found");
        return product.get();
    }
}
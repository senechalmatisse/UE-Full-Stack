package fr.fullstack.shopapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.*;

/**
 * Entité représentant une catégorie de produits dans le modèle de données.
 * <p>
 * Cette classe assure le mapping avec la table relationnelle "categories".
 * Elle définit la structure fondamentale utilisée pour organiser le catalogue de produits.
 */
@Entity
@Table(name = "categories")
public class Category {

    /**
     * Identifiant technique unique de la catégorie (Clé Primaire).
     * <p>
     * La génération de cette valeur est déléguée au fournisseur de persistance
     * via la stratégie {@link GenerationType#AUTO}, assurant ainsi l'unicité de l'enregistrement
     * au sein de la base de données sans intervention manuelle de l'application.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    /**
     * Libellé désignant la catégorie.
     * <p>
     * Cet attribut est soumis à des contraintes de validation strictes : il ne peut être nul
     * et sa longueur doit être comprise entre 1 et 255 caractères.
     */
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    @NotNull(message = "Name may not be null")
    @Column(nullable = false)
    private String name;

    /**
     * Liste des produits associés à cette catégorie.
     * <p>
     * Cette propriété matérialise une relation de type "Plusieurs-à-Plusieurs" (Many-to-Many).
     * L'attribut {@code mappedBy = "categories"} indique que la gestion de la relation est portée
     * par l'entité {@link Product} (le propriétaire de la relation).
     */
    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private List<Product> products = new ArrayList<Product>();

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
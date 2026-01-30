package fr.fullstack.shopapp.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.elasticsearch.annotations.*;

import java.util.*;

/**
 * Entité centrale du catalogue représentant un produit commercialisable.
 */
@Entity
@Table(name = "products")
public class Product {

    /**
     * Liste des catégories de classification auxquelles le produit est rattaché.
     */
    @ManyToMany
    @JoinTable(
            name = "products_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private List<Category> categories = new ArrayList<Category>();

    /**
     * Identifiant technique unique du produit.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Field(type = FieldType.Long)
    private long id;

    /**
     * Liste des informations descriptives localisées (Nom, Description par langue).
     */
    @OneToMany(cascade = {CascadeType.ALL}, orphanRemoval = true)
    @Size(min = 1, message = "At least one name and one description must be provided")
    private List<@Valid LocalizedProduct> localizedProduct = new ArrayList<LocalizedProduct>();

    /**
     * Prix unitaire de vente du produit.
     */
    @Column(nullable = false)
    @PositiveOrZero(message = "Price must be positive")
    @NotNull(message = "Price may not be null")
    private float price;

    /**
     * Boutique propriétaire commercialisant ce produit.
     */
    @ManyToOne
    private Shop shop;

    public List<Category> getCategories() {
        return categories;
    }

    public long getId() {
        return id;
    }

    public List<LocalizedProduct> getLocalizedProducts() {
        return localizedProduct;
    }

    public float getPrice() {
        return price;
    }

    public Shop getShop() {
        return shop;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setLocalizedProducts(List<LocalizedProduct> localizedProduct) {
        this.localizedProduct = localizedProduct;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public void setShop(Shop shop) {
        this.shop = shop;
    }
}
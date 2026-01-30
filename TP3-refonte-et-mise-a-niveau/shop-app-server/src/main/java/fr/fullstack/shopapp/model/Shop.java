package fr.fullstack.shopapp.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un établissement commercial (Boutique) au sein de la plateforme.
 */
@Entity
@Table(name = "shops")
@Document(indexName = "idx_shops")
public class Shop {

    /**
     * Horodatage technique marquant la date d'inscription de la boutique.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Field(type = FieldType.Date)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    /**
     * Identifiant unique technique de la boutique.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Field(type = FieldType.Long)
    private long id;

    /**
     * Indicateur de statut opérationnel.
     */
    @Column(nullable = false)
    @NotNull(message = "InVacations may not be null")
    @Field(type = FieldType.Boolean)
    private boolean inVacations;

    /**
     * Dénomination commerciale de la boutique.
     */
    @Column(nullable = false)
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    @NotNull(message = "Name may not be null")
    @Field(type = FieldType.Text)
    private String name;

    /**
     * Métrique calculée représentant le volume du catalogue de la boutique.
     */
    @Formula(value = "(SELECT COUNT(*) FROM products p WHERE p.shop_id = id)")
    private Long nbProducts;

    /**
     * Planning hebdomadaire des horaires d'ouverture.
     */
    @OneToMany(cascade = {CascadeType.ALL})
    private List<@Valid OpeningHoursShop> openingHours = new ArrayList<OpeningHoursShop>();

    /**
     * Liste des produits rattachés à la boutique.
     */
    @OneToMany(mappedBy = "shop", fetch = FetchType.LAZY)
    @JsonIgnore
    @Transient
    private List<Product> products = new ArrayList<Product>();

    /**
     * Métrique calculée indiquant la diversité du catalogue.
     */
    @Formula(value = "(SELECT COUNT(DISTINCT pc.category_id) FROM products_categories pc WHERE pc.product_id IN " +
            "(SELECT p.id FROM products p WHERE p.shop_id = id))")
    private Long nbCategories;

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public long getId() {
        return id;
    }

    public boolean getInVacations() {
        return inVacations;
    }

    public String getName() {
        return name;
    }

    public long getNbProducts() {
        return nbProducts;
    }

    public List<OpeningHoursShop> getOpeningHours() {
        return openingHours;
    }

    public List<Product> getProducts() {
        return this.products;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setInVacations(boolean inVacations) {
        this.inVacations = inVacations;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setNbProducts(long nbProducts) {
        this.nbProducts = nbProducts;
    }

    public void setOpeningHours(List<OpeningHoursShop> openingHours) {
        this.openingHours = openingHours;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public Long getNbCategories() {
        return nbCategories;
    }

    public void setNbCategories(Long nbCategories) {
        this.nbCategories = nbCategories;
    }
}
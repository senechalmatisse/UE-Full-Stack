package fr.fullstack.shopapp.model;

import fr.fullstack.shopapp.validation.StringEnumeration;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

/**
 * Entité de persistance dédiée à l'internationalisation des informations produits.
 * <p>
 * Cette classe a pour responsabilité de stocker les attributs textuels variables selon la langue (nom et description).
 */
@Entity
@Table(name = "LocalizedProduct")
public class LocalizedProduct {

    /**
     * Descriptif détaillé du produit adapté à la langue cible.
     */
    @Column
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    private String description;

    /**
     * Identifiant technique unique de la version localisée.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    /**
     * Code linguistique associé aux données (ex: 'FR', 'EN').
     */
    @Column(nullable = false)
    @StringEnumeration(enumClass = Locale.class, message = "Locale must be FR or EN")
    @NotNull(message = "Locale may not be null")
    private String locale;

    /**
     * Libellé du produit traduit dans la langue spécifiée.
     */
    @Column(nullable = false)
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    @NotNull(message = "Name may not be null")
    private String name;

    public String getDescription() {
        return description;
    }

    public long getId() {
        return id;
    }

    public String getLocale() {
        return locale;
    }

    public String getName() {
        return name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public void setName(String name) {
        this.name = name;
    }
}
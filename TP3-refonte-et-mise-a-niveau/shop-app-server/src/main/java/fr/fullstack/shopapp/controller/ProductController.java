package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Product;
import fr.fullstack.shopapp.service.ProductService;
import fr.fullstack.shopapp.util.ErrorValidation;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * Contrôleur REST assurant la gestion du cycle de vie des produits.
 * <p>
 * Cette classe expose l'interface publique de l'application concernant les ressources "Produit".
 */
@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Product Management", description = "APIs for managing products")
public class ProductController {

    /**
     * Service métier encapsulant la logique de gestion des produits.
     */
    @Autowired
    private ProductService service;

    /**
     * Orchestre la création d'un nouveau produit dans le catalogue.
     * <p>
     * Cette méthode traite les requêtes POST contenant la définition d'un produit. Avant de solliciter
     * le service métier, elle effectue une validation rigoureuse des données entrantes via le validateur
     * standard (Bean Validation). En cas de non-conformité des données (champs manquants ou invalides),
     * le traitement est interrompu et une exception explicite est levée, renvoyant un code d'erreur 400
     * accompagné des détails de validation.
     *
     * @param product L'entité produit désérialisée depuis le corps de la requête JSON.
     * @param errors  L'objet collectant les résultats de la validation et les éventuelles erreurs.
     * @return Une réponse HTTP 200 contenant l'objet produit tel qu'il a été persisté.
     * @throws Exception Si une erreur survient durant le processus de validation ou de création.
     */
    @Operation(summary = "Create a product", description = "Create a new product")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product created successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Product.class))}),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok(service.createProduct(product));
    }

    /**
     * Gère la suppression d'un produit identifié de manière unique.
     * <p>
     * Ce point de terminaison permet de retirer un produit du catalogue en fournissant son identifiant.
     * L'opération délègue l'exécution à la couche de service. Conformément à la sémantique REST,
     * la méthode retourne un statut HTTP 204 (No Content) pour indiquer que la requête a été traitée
     * avec succès mais qu'aucune donnée n'est renvoyée dans le corps de la réponse.
     *
     * @param id L'identifiant technique du produit à supprimer.
     * @return Le statut HTTP 204 confirmant l'action.
     * @throws Exception Si le produit cible n'existe pas ou ne peut être supprimé.
     */
    @Operation(summary = "Delete a product by its id", description = "Delete a specific product")
    @DeleteMapping("/{id}")
    public HttpStatus deleteProduct(@PathVariable long id) throws Exception {
        service.deleteProductById(id);
        return HttpStatus.NO_CONTENT;
    }

    /**
     * Récupère les détails complets d'un produit spécifique.
     * <p>
     * Cette méthode interroge le service métier pour obtenir l'entité correspondant à l'identifiant fourni.
     * Elle encapsule le résultat dans une réponse HTTP standardisée, permettant aux consommateurs de l'API
     * d'accéder aux attributs du produit. La gestion des cas où le produit est introuvable est assurée
     * en amont par le service ou via la gestion globale des exceptions.
     *
     * @param id L'identifiant unique du produit recherché.
     * @return Une réponse HTTP 200 contenant l'objet produit.
     * @throws Exception En cas d'erreur de récupération.
     */
    @Operation(summary = "Get a product by id", description = "Retrieve a specific product by its id")
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable long id) throws Exception {
        return ResponseEntity.ok().body(service.getProductById(id));
    }

    /**
     * Restitue une liste de produits avec support de la pagination et du filtrage contextuel.
     * <p>
     * Ce point de terminaison offre une flexibilité importante pour la recherche de produits. Il combine
     * la pagination standard (via {@link Pageable}) avec des critères de filtrage optionnels. L'utilisation
     * du type {@link Optional} pour les paramètres {@code shopId} et {@code categoryId} permet au client
     * de l'API de demander, au choix, l'ensemble des produits, ou seulement ceux appartenant à une boutique
     * ou une catégorie spécifique. Cette approche évite la multiplication des endpoints pour chaque combinaison de filtres.
     *
     * @param pageable   Les informations de pagination (page, taille, tri) fournies par le client.
     * @param shopId     (Optionnel) L'identifiant de la boutique pour filtrer les résultats.
     * @param categoryId (Optionnel) L'identifiant de la catégorie pour restreindre la recherche.
     * @return Une page de résultats contenant les produits correspondant aux critères.
     */
    @Operation(summary = "Get products", description = "Retrieve paginated products, optionally filtered by shop or category")
    @GetMapping
    public ResponseEntity<Page<Product>> getProductsOfShop(
            @ParameterObject Pageable pageable,
            @Parameter(description = "Id of the shop") @RequestParam Optional<Long> shopId,
            @Parameter(description = "Id of the category") @RequestParam Optional<Long> categoryId) {
        return ResponseEntity.ok(service.getShopProductList(shopId, categoryId, pageable));
    }

    /**
     * Applique les modifications sur un produit existant.
     * <p>
     * Similaire au processus de création, cette méthode reçoit une représentation mise à jour d'un produit.
     * Elle garantit l'intégrité des données modifiées grâce à une validation stricte avant de transmettre
     * la demande de persistance. Ce mécanisme assure que les règles métier et les contraintes de format
     * sont respectées tout au long du cycle de vie de l'objet.
     *
     * @param product L'objet produit contenant les nouvelles valeurs.
     * @param errors  Le registre des erreurs de validation détectées.
     * @return Une réponse HTTP 200 avec le produit mis à jour.
     * @throws Exception Si la validation échoue ou si une erreur survient lors de la mise à jour.
     */
    @Operation(summary = "Update a product", description = "Update an existing product")
    @PutMapping
    public ResponseEntity<Product> updateProduct(@Valid @RequestBody Product product, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok().body(service.updateProduct(product));
    }
}
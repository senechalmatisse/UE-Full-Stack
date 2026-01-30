package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Shop;
import fr.fullstack.shopapp.service.ShopService;
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
 * Contrôleur REST responsable de l'administration et de la consultation des boutiques.
 * <p>
 * Ce composant expose une interface complète pour la gestion du cycle de vie des entités "Shop".
 */
@RestController
@RequestMapping("/api/v1/shops")
@Tag(name = "Shop Management", description = "APIs for managing shops")
public class ShopController {

    /**
     * Couche de service injectée pour la gestion de la logique métier des boutiques.
     */
    @Autowired
    private ShopService service;

    /**
     * Enregistre une nouvelle boutique dans le système.
     * <p>
     * Cette méthode réceptionne une représentation JSON d'une boutique et initie le processus de persistance.
     * Avant toute interaction avec la couche métier, une validation structurelle est opérée grâce à l'annotation
     * {@link Valid}. Si des incohérences sont détectées dans le modèle reçu, le traitement est immédiatement
     * interrompu et une exception détaillée est levée, garantissant ainsi que seules des données valides
     * intègrent la base de données.
     *
     * @param shop   L'objet boutique à créer.
     * @param errors Le registre capturant les violations de contraintes de validation.
     * @return La boutique créée avec son identifiant généré (HTTP 200).
     * @throws Exception En cas d'échec de la validation ou de la création.
     */
    @Operation(summary = "Create a shop", description = "Create a new shop")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Shop created successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Shop.class))}),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<Shop> createShop(@Valid @RequestBody Shop shop, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok(service.createShop(shop));
    }

    /**
     * Supprime une boutique du référentiel.
     * <p>
     * Ce point de terminaison permet la suppression définitive d'une ressource identifiée par sa clé primaire.
     * L'opération respecte la sémantique HTTP en retournant un code 204 (No Content) en cas de succès,
     * signalant au client que l'action a été effectuée sans renvoyer de corps de réponse.
     *
     * @param id L'identifiant technique de la boutique à supprimer.
     * @return Le statut HTTP 204 confirmant la suppression.
     * @throws Exception Si la ressource est introuvable ou protégée.
     */
    @Operation(summary = "Delete a shop by its id", description = "Delete a specific shop")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Shop deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid id supplied")
    })
    @DeleteMapping("/{id}")
    public HttpStatus deleteShop(@PathVariable long id) throws Exception {
        service.deleteShopById(id);
        return HttpStatus.NO_CONTENT;
    }

    /**
     * Expose un moteur de recherche multicritère pour les boutiques.
     * <p>
     * Cette méthode complexe agrège plusieurs fonctionnalités de recherche et de tri. Elle accepte des paramètres
     * optionnels permettant de filtrer les résultats par nom, statut de vacances ou plage de dates de création.
     * Un traitement préliminaire est appliqué au paramètre de recherche textuelle pour nettoyer les chaînes vides
     * ou constituées uniquement d'espaces, optimisant ainsi la requête sous-jacente. Le résultat est encapsulé
     * dans un objet {@link Page} pour permettre une navigation fluide au sein des jeux de données volumineux.
     *
     * @param pageable      Configuration de la pagination et du tri.
     * @param search        (Optionnel) Terme de recherche textuelle sur le nom.
     * @param sortBy        (Optionnel) Champ spécifique pour le tri personnalisé.
     * @param inVacations   (Optionnel) Filtre sur le statut "en congé".
     * @param createdAfter  (Optionnel) Filtre de date de début (format ISO).
     * @param createdBefore (Optionnel) Filtre de date de fin (format ISO).
     * @return Une liste paginée de boutiques correspondant aux critères cumulés.
     */
    @Operation(summary = "Get shops", description = "Retrieve paginated shops with optional filtering and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Shops retrieved successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Page.class))})
    })
    @GetMapping
    public ResponseEntity<Page<Shop>> getAllShops(
        @ParameterObject Pageable pageable,
        @Parameter(description = "Plain text search on name of the shop") @RequestParam Optional<String> search,
        @Parameter(description = "Sort shops by field (e.g., 'name', 'nbProducts', 'createdAt')") @RequestParam Optional<String> sortBy,
        @Parameter(description = "Filter shops based on vacation status") @RequestParam Optional<Boolean> inVacations,
        @Parameter(description = "Filter shops created after this date (YYYY-MM-DD)") @RequestParam Optional<String> createdAfter,
        @Parameter(description = "Filter shops created before this date (YYYY-MM-DD)") @RequestParam Optional<String> createdBefore
    ) {
        Optional<String> cleanedSearch = search
            .map(String::trim)
            .filter(s -> !s.isEmpty());

        return ResponseEntity.ok(
            service.getShopList(cleanedSearch, sortBy, inVacations, createdAfter, createdBefore, pageable)
        );
    }

    /**
     * Restitue les informations détaillées d'une boutique spécifique.
     * <p>
     * Ce service de consultation unitaire permet d'obtenir l'état courant d'une boutique via son identifiant.
     * Il agit comme un proxy direct vers la couche de service, renvoyant l'objet métier complet si celui-ci
     * existe dans la base de données.
     *
     * @param id L'identifiant unique de la boutique.
     * @return L'instance de la boutique demandée.
     * @throws Exception Si la boutique n'est pas trouvée.
     */
    @Operation(summary = "Get a shop by id", description = "Retrieve a specific shop by its id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Shop found",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Shop.class))}),
            @ApiResponse(responseCode = "404", description = "Shop not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable long id) throws Exception {
        return ResponseEntity.ok().body(service.getShopById(id));
    }

    /**
     * Met à jour les données d'une boutique existante.
     * <p>
     * Cette opération permet la modification des attributs d'une boutique. À l'instar de la création,
     * les données soumises font l'objet d'une validation rigoureuse. Cette étape est cruciale pour
     * maintenir la cohérence des données métier lors des mises à jour partielles ou complètes de la ressource.
     *
     * @param shop   L'objet boutique contenant les modifications.
     * @param errors Le conteneur d'erreurs de validation.
     * @return La boutique mise à jour (HTTP 200).
     * @throws Exception En cas d'erreur de validation ou de traitement métier.
     */
    @Operation(summary = "Update a shop", description = "Update an existing shop")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Shop updated successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Shop.class))}),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping
    public ResponseEntity<Shop> updateShop(@Valid @RequestBody Shop shop, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok().body(service.updateShop(shop));
    }
}
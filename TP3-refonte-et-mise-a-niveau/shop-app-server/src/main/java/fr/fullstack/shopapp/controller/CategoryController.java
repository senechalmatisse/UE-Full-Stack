package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Category;
import fr.fullstack.shopapp.service.CategoryService;
import fr.fullstack.shopapp.util.ErrorValidation;
import io.swagger.v3.oas.annotations.Operation;
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

/**
 * Contrôleur REST dédié à la gestion des catégories de produits.
 * <p>
 * Cette classe expose l'ensemble des endpoints nécessaires aux opérations CRUD sur les ressources de type "Catégorie".
 */
@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Category Management", description = "APIs for managing categories")
public class CategoryController {

    /**
     * Service métier gérant la logique transactionnelle des catégories.
     */
    @Autowired
    private CategoryService service;

    /**
     * Traite la requête de création d'une nouvelle catégorie.
     * <p>
     * Cette méthode reçoit les données de la catégorie au format JSON dans le corps de la requête.
     * Avant de solliciter le service métier, elle effectue une validation stricte des attributs via
     * l'annotation {@link Valid}. En cas d'incohérence ou de non-respect des contraintes de validation,
     * une exception est levée avec un message d'erreur détaillé, garantissant l'intégrité des données
     * avant leur persistance.
     *
     * @param category L'objet catégorie à persister, hydraté depuis le corps de la requête.
     * @param errors   Le conteneur capturant les éventuelles erreurs de validation lors du binding.
     * @return Une réponse HTTP 200 contenant la catégorie créée.
     * @throws ResponseStatusException Si les données fournies sont invalides (HTTP 400).
     * @throws Exception En cas d'erreur interne lors du traitement.
     */
    @Operation(summary = "Create a category", description = "Create a new category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category created successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Category.class))}),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok(service.createCategory(category));
    }

    /**
     * Gère la suppression d'une catégorie spécifique.
     * <p>
     * Ce point de terminaison permet de retirer une ressource identifiée par son identifiant unique.
     * L'opération délègue la logique de suppression au service sous-jacent. Conformément aux conventions
     * HTTP pour une suppression réussie ne nécessitant pas de contenu en retour, la méthode renvoie
     * un statut "No Content" (204).
     *
     * @param id L'identifiant unique de la catégorie à supprimer.
     * @return Le statut HTTP 204 (No Content) confirmant la suppression.
     * @throws Exception Si la catégorie n'existe pas ou ne peut être supprimée.
     */
    @Operation(summary = "Delete a category by its id", description = "Delete a specific category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid id supplied")
    })
    @DeleteMapping("/{id}")
    public HttpStatus deleteCategory(@PathVariable long id) throws Exception {
        service.deleteCategoryById(id);
        return HttpStatus.NO_CONTENT;
    }

    /**
     * Récupère la liste des catégories de manière paginée.
     * <p>
     * Afin d'optimiser les performances et la consommation de bande passante, cette méthode ne retourne
     * pas l'intégralité de la base de données, mais une page spécifique de résultats. Elle utilise
     * l'objet {@link Pageable} pour gérer les paramètres de pagination (numéro de page, taille, tri)
     * fournis dans la requête, facilitant ainsi la navigation au sein d'un grand volume de données.
     *
     * @param pageable Les paramètres de pagination extraits de la requête (page, size, sort).
     * @return Une réponse HTTP 200 contenant la page de catégories demandée.
     */
    @Operation(summary = "Get categories", description = "Retrieve paginated categories")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categories retrieved successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Page.class))})
    })
    @GetMapping
    public ResponseEntity<Page<Category>> getAllCategories(
        @ParameterObject Pageable pageable
    ) {
        return ResponseEntity.ok(service.getCategoryList(pageable));
    }

    /**
     * Recherche et retourne une catégorie unique par son identifiant.
     * <p>
     * Cette méthode permet d'accéder aux détails d'une ressource spécifique. Elle interroge le service
     * métier avec l'identifiant fourni dans l'URL. Si la ressource est trouvée, elle est retournée
     * dans le corps de la réponse ; dans le cas contraire, le service est chargé de gérer l'exception
     * appropriée (généralement une erreur 404).
     *
     * @param id L'identifiant unique de la catégorie recherchée.
     * @return Une réponse HTTP 200 contenant l'objet catégorie trouvé.
     * @throws Exception Si la catégorie n'est pas trouvée.
     */
    @Operation(summary = "Get a category by id", description = "Retrieve a specific category by its id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category found",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Category.class))}),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
        @PathVariable long id
    ) throws Exception {
        return ResponseEntity.ok().body(service.getCategoryById(id));
    }

    /**
     * Traite la mise à jour d'une catégorie existante.
     * <p>
     * Similaire à la création, cette opération reçoit un objet modifié et valide son intégrité via
     * l'annotation {@link Valid}. Si les données sont conformes, la requête est transmise à la couche
     * service pour appliquer les modifications en base de données. Ce mécanisme assure que seules
     * des données cohérentes modifient l'état du système.
     *
     * @param category L'objet catégorie contenant les nouvelles informations.
     * @param errors   Le conteneur capturant les erreurs de validation.
     * @return Une réponse HTTP 200 contenant la catégorie mise à jour.
     * @throws ResponseStatusException Si les données fournies sont invalides (HTTP 400).
     * @throws Exception En cas d'erreur lors de la mise à jour.
     */
    @Operation(summary = "Update a category", description = "Update an existing category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category updated successfully",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = Category.class))}),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping
    public ResponseEntity<Category> updateCategory(@Valid @RequestBody Category category, Errors errors) throws Exception {
        if (errors.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ErrorValidation.getErrorValidationMessage(errors)
            );
        }

        return ResponseEntity.ok().body(service.updateCategory(category));
    }
}
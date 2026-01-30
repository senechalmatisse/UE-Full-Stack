package fr.fullstack.shopapp.validation;

import jakarta.validation.*;
import java.lang.annotation.*;

/**
 * Définition d'une contrainte de validation personnalisée pour les chaînes de caractères.
 */
@Documented
@Constraint(validatedBy = StringEnumerationValidator.class)
@Target({
    ElementType.METHOD,
    ElementType.FIELD,
    ElementType.ANNOTATION_TYPE,
    ElementType.CONSTRUCTOR,
    ElementType.PARAMETER,
    ElementType.TYPE_USE
})
@Retention(RetentionPolicy.RUNTIME)
public @interface StringEnumeration {

    /**
     * Définit la classe de l'énumération de référence utilisée pour la validation.
     *
     * @return La classe de type Enum servant de référentiel.
     */
    Class<? extends Enum<?>> enumClass();

    /**
     * Permet de restreindre l'application de la contrainte à certains groupes de validation.
     *
     * @return Le tableau des groupes de validation ciblés (vide par défaut).
     */
    Class<?>[] groups() default {};

    /**
     * Définit le modèle du message d'erreur renvoyé en cas d'échec de la validation.
     *
     * @return Le message d'erreur ou la clé de ressource correspondante.
     */
    String message() default "{com.xxx.bean.validation.constraints.StringEnumeration.message}";

    /**
     * Associe des métadonnées personnalisées (payload) à la contrainte.
     *
     * @return Le tableau des classes de payload (vide par défaut).
     */
    Class<? extends Payload>[] payload() default {};
}
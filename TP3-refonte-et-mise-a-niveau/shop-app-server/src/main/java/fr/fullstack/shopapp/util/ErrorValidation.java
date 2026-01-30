package fr.fullstack.shopapp.util;

import org.springframework.validation.*;

import java.util.List;

/**
 * Classe utilitaire dédiée à la standardisation des messages d'erreur de validation.
 */
public class ErrorValidation {

    /**
     * Agrège la liste des erreurs de validation en une chaîne de caractères unique.
     *
     * @param errors L'objet conteneur capturant l'ensemble des erreurs de liaison et de validation du modèle.
     * @return Une chaîne formatée contenant la concaténation de tous les messages d'erreur, prête à être affichée.
     */
    public static String getErrorValidationMessage(Errors errors) {
        String message = "";
        List<ObjectError> objectErrors = errors.getAllErrors();

        for (int i = 0; i < errors.getErrorCount(); i++) {
            ObjectError error = objectErrors.get(i);
            message += error.getDefaultMessage() + "; ";
        }

        return message.substring(0, message.length() - 2);
    }
}
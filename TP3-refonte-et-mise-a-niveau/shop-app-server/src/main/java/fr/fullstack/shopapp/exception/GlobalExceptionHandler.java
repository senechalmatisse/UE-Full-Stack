package fr.fullstack.shopapp.exception;

import org.springframework.validation.DataBinder;
import org.springframework.web.bind.annotation.*;

/**
 * Composant transverse de configuration pour la couche de présentation.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Configure la stratégie d'accès aux propriétés des objets lors de la liaison de données.
     *
     * @param dataBinder Le gestionnaire de liaison de données fourni par le contexte Spring.
     */
    @InitBinder
    private void activateDirectFieldAccess(DataBinder dataBinder) {
        dataBinder.initDirectFieldAccess();
    }
}
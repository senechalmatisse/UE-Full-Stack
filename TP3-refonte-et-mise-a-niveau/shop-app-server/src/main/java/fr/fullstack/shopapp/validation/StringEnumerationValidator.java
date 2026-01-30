package fr.fullstack.shopapp.validation;

import jakarta.validation.*;
import java.util.*;

/**
 * Implémentation technique de la logique de validation pour la contrainte {@link StringEnumeration}.
 */
public class StringEnumerationValidator implements ConstraintValidator<StringEnumeration, String> {

    /**
     * Cache contenant l'ensemble des valeurs textuelles autorisées pour l'énumération cible.
     */
    private Set<String> AVAILABLE_ENUM_NAMES;

    /**
     * Méthode utilitaire statique chargée d'extraire les noms des constantes d'une énumération.
     *
     * @param e La classe de l'énumération (Class&lt;? extends Enum&lt;?&gt;&gt;) dont il faut extraire les valeurs.
     * @return Un ensemble (Set) contenant les noms de toutes les constantes de l'énumération.
     */
    public static Set<String> getNamesSet(Class<? extends Enum<?>> e) {
        Enum<?>[] enums = e.getEnumConstants();
        String[] names = new String[enums.length];
        for (int i = 0; i < enums.length; i++) names[i] = enums[i].name();
        Set<String> mySet = new HashSet<String>(Arrays.asList(names));
        return mySet;
    }

    /**
     * Initialise le contexte du validateur avant toute opération de vérification.
     *
     * @param stringEnumeration L'instance de l'annotation contenant les paramètres de configuration.
     */
    @Override
    public void initialize(StringEnumeration stringEnumeration) {
        Class<? extends Enum<?>> enumSelected = stringEnumeration.enumClass();
        AVAILABLE_ENUM_NAMES = getNamesSet(enumSelected);
    }

    /**
     * Exécute la règle de validation sur la valeur fournie.
     *
     * @param value   La chaîne de caractères à valider.
     * @param context Le contexte d'exécution du validateur (permettant éventuellement de personnaliser les messages d'erreur).
     * @return {@code true} si la valeur est nulle ou correspond à une constante de l'énumération, {@code false} sinon.
     */
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        else return AVAILABLE_ENUM_NAMES.contains(value);
    }
}
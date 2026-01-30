/**
 * Utilitaire de gestion grammaticale pour l'interface utilisateur.
 * <p>
 * Cette fonction pure détermine dynamiquement la graphie correcte d'un mot en fonction de la cardinalité associée.
 * En évaluant la valeur numérique fournie, elle applique conditionnellement la règle standard de pluralisation
 * (ajout du suffixe 's') à la chaîne de caractères. Cette abstraction permet de garantir la correction syntaxique
 * des messages affichés, notamment pour les compteurs d'inventaire ou les récapitulatifs de listes.
 * </p>
 *
 * @param word Le terme singulier à accorder.
 * @param nb La valeur numérique déterminant le nombre.
 * @returns La chaîne de caractères potentiellement suffixée.
 */
export const pluralize = (word: string, nb: number) => `${word}${nb > 1 ? 's' : ''}`;

/**
 * Formateur standardisé pour les valeurs monétaires.
 * <p>
 * Ce module exploite l'API native standard <code>Intl.NumberFormat</code> pour convertir les valeurs numériques
 * brutes en chaînes de caractères conformes aux conventions locales françaises (fr-FR).
 * Il assure automatiquement la gestion des séparateurs de milliers, de la virgule décimale et du positionnement
 * du symbole Euro, garantissant ainsi une présentation uniforme et professionnelle des prix à travers toute l'application.
 * </p>
 *
 * @param price La valeur numérique du prix à formater.
 * @returns Le prix formaté en chaîne de caractères (ex: "1 250,00 €").
 */
export const priceFormatter = (price: number) => {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    });
    return formatter.format(price);
};
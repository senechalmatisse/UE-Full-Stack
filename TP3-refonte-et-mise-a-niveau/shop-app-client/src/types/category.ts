/**
 * Définition structurelle de base pour l'entité catégorie.
 * <p>
 * Ce type abstrait le socle commun des données fonctionnelles, isolant les propriétés métier
 * invariantes telles que le nom. Cette factorisation permet d'assurer la cohérence des données
 * à travers les différentes variantes de l'objet (lecture, création, modification) sans dupliquer
 * la définition des champs.
 * </p>
 */
type CategoryBase = {
    name: string;
};

/**
 * Représentation complète de l'entité Catégorie persistée.
 * <p>
 * Ce type étend la structure de base en y adjoignant un identifiant numérique strict.
 * Il constitue le contrat de données principal utilisé lors de la récupération d'informations
 * depuis le serveur, garantissant que tout objet de type <code>Category</code> manipulé
 * dans l'application possède une identité confirmée par la base de données.
 * </p>
 */
export type Category = {
    id: number;
} & CategoryBase;

/**
 * Objet de transfert de données (DTO) pour les opérations de mutation.
 * <p>
 * Conçu spécifiquement pour les contextes de création ou de mise à jour (formulaires),
 * ce type assouplit les contraintes sur l'identifiant. En le rendant optionnel et typé
 * comme chaîne de caractères, il s'adapte à la nature flexible des données en cours de saisie,
 * où l'identité de l'objet peut être indéfinie (création) ou issue de paramètres d'URL (chaînes).
 * </p>
 */
export type MinimalCategory = {
    id?: string;
} & CategoryBase;
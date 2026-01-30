import OpeningHours from './openingHours';

/**
 * Définition canonique de l'entité Boutique (Modèle de Lecture).
 * <p>
 * Ce type représente la structure complète de l'objet tel qu'il est restitué par le backend
 * après persistance. Il agit comme un contrat de données riche qui agrège trois dimensions d'information :
 * les données métier éditables (nom, statut de congés, horaires), les métadonnées système immuables
 * (identifiant numérique, date de création) et les indicateurs statistiques calculés côté serveur
 * (nombre de produits et de catégories).
 * </p>
 * <p>
 * Cette structure est utilisée principalement pour l'affichage dans les vues de consultation
 * (Tableau de bord, Détail boutique), où la richesse de l'information prime sur la mutabilité.
 * </p>
 */
export type Shop = {
    id: number;
    createdAt: Date;
    name: string;
    inVacations: boolean;
    openingHours: OpeningHours[];
    nbProducts: number;
    nbCategories: number;
};

/**
 * Structure de données allégée pour la gestion transactionnelle (Modèle d'Écriture).
 * <p>
 * Ce type, aussi qualifié d'Objet de Transfert de Données (DTO), est spécifiquement conçu
 * pour alimenter les formulaires de création et d'édition. Contrairement au modèle de lecture,
 * il exclut les champs calculés (statistiques) et les métadonnées de système (date de création)
 * pour se concentrer exclusivement sur les informations manipulables par l'utilisateur.
 * </p>
 * <p>
 * Une particularité notable réside dans le typage de l'identifiant : défini comme optionnel
 * et de type chaîne de caractères, il offre la flexibilité nécessaire pour gérer indifféremment
 * les contextes de création (où l'ID est inexistant) et de mise à jour (où l'ID provient souvent
 * des paramètres d'URL sous forme de chaîne), sans nécessiter de conversion préalable stricte.
 * </p>
 */
export type MinimalShop = {
    id?: string;
    name: string;
    inVacations: boolean;
    openingHours: { day: number; openAt: string; closeAt: string }[];
};
import { Category, MinimalCategory } from './category';
import OpeningHours from './openingHours';
import { LocalizedProduct, MinimalLocalizedProduct, Product, MinimalProduct, FormattedProduct } from './product';
import { ResponseArray } from './response';
import { Shop, MinimalShop } from './shop';
import Toast from './toast';
import ObjectPropertyString from './utils';

/**
 * Point d'entrée unique (Barrel File) pour le système de typage de l'application.
 * <p>
 * Ce module centralise l'exposition de l'ensemble des contrats de données TypeScript du projet.
 * En appliquant le patron de conception "Barrel", il agrège trois catégories distinctes de types :
 * les modèles de domaine canoniques (lecture), les objets de transfert de données ou DTO (écriture/mutation),
 * ainsi que les utilitaires techniques transverses (réponses API, notifications, erreurs).
 * </p>
 * <p>
 * Cette abstraction structurelle offre un avantage significatif pour la maintenabilité du code :
 * elle découple l'organisation physique des fichiers de définitions de leur consommation logique.
 * Par conséquent, les composants et services importateurs peuvent référencer n'importe quelle interface
 * via un chemin d'accès unique et stable, indépendamment des refactorisations internes futures du dossier <code>types</code>.
 * </p>
 */
export type {
    Category,
    FormattedProduct,
    LocalizedProduct,
    MinimalCategory,
    MinimalLocalizedProduct,
    MinimalProduct,
    MinimalShop,
    ObjectPropertyString,
    OpeningHours,
    Product,
    ResponseArray,
    Shop,
    Toast,
};
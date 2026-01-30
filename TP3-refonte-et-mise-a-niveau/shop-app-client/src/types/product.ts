import { Category } from './category';
import { Shop } from './shop';

/**
 * Socle commun pour les données textuelles localisées.
 * <p>
 * Ce type abstrait définit la structure atomique d'une traduction, regroupant le code de langue
 * ainsi que le contenu rédactionnel associé (nom et description). Il sert de base pour la construction
 * des entités persistées ou des objets de transfert liés à l'internationalisation.
 * </p>
 */
type LocalizedProductBase = {
    locale: string;
    name: string;
    description: string;
};

/**
 * Représentation d'une traduction persistée.
 * <p>
 * Cette définition étend la base textuelle en y adjoignant un identifiant numérique strict,
 * certifiant que la donnée provient de la base de données.
 * </p>
 */
export type LocalizedProduct = {
    id: number;
} & LocalizedProductBase;

/**
 * Objet de transfert pour les traductions en cours d'édition.
 * <p>
 * Utilisé dans les formulaires, ce type rend l'identifiant optionnel, permettant ainsi
 * de manipuler indifféremment des traductions existantes (avec ID) ou nouvelles (sans ID)
 * au sein d'une même structure.
 * </p>
 */
export type MinimalLocalizedProduct = {
    id?: number;
} & LocalizedProductBase;

/**
 * Noyau technique de l'entité Produit.
 * <p>
 * Ce type regroupe les attributs invariants du produit, c'est-à-dire les données qui ne dépendent pas
 * de la langue de l'utilisateur. Il définit notamment les relations structurelles avec le magasin propriétaire
 * (qui peut être nul) et les catégories de classement, ainsi que la tarification.
 * </p>
 */
type ProductBase = {
    price: number;
    shop: Shop | null;
    categories: Category[];
};

/**
 * Entité Produit canonique (Modèle de persistance).
 * <p>
 * Ce type représente l'objet complet tel qu'il est stocké et restitué par le backend.
 * Il se caractérise par une structure composite complexe où les informations textuelles ne sont pas
 * portées directement par le produit, mais par une collection d'objets `localizedProducts`.
 * Cette architecture "One-to-Many" permet de supporter un nombre arbitraire de langues pour un même article.
 * </p>
 */
export type Product = {
    id: number;
    localizedProducts: LocalizedProduct[];
} & ProductBase;

/**
 * Objet de Transfert de Données (DTO) pour la mutation (Modèle de formulaire).
 * <p>
 * Conçu pour les opérations de création et de mise à jour ("Upsert"), ce type assouplit les contraintes
 * sur l'identifiant (typage chaîne ou indéfini) et intègre la version "Minimale" des traductions.
 * Cela permet au client d'envoyer une structure unifiée au serveur, que ce soit pour créer un nouveau produit
 * ou pour sauvegarder les modifications d'un produit existant.
 * </p>
 */
export type MinimalProduct = {
    id?: string;
    localizedProducts: MinimalLocalizedProduct[];
} & ProductBase;

/**
 * Modèle de Vue (View Model) pour l'affichage final.
 * <p>
 * Ce type représente une projection "aplatie" de l'entité produit, optimisée pour le rendu de l'interface utilisateur.
 * Contrairement à l'entité canonique qui contient toutes les traductions, ce format ne conserve que
 * le nom et la description correspondant à la locale active de l'utilisateur.
 * Cette transformation simplifie considérablement la logique des composants visuels (`ProductCard`, `ProductDetails`),
 * qui peuvent ainsi consommer directement les champs `name` et `description` sans avoir à filtrer
 * le tableau des traductions à chaque rendu.
 * </p>
 */
export type FormattedProduct = {
    id: number;
    name: string;
    description: string;
} & ProductBase;
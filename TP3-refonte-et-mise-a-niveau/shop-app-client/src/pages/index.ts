import Categories from './Categories';
import CategoryDetails from './CategoryDetails';
import Home from './Home';
import ProductDetails from './ProductDetails';
import ProductForm from './ProductForm';
import Products from './Products';
import ShopDetails from './ShopDetails';
import ShopForm from './ShopForm';

/**
 * Point d'entrée centralisé (Barrel File) pour l'ensemble des vues de l'application.
 * <p>
 * Ce module implémente le patron de conception "Barrel" afin d'agréger et de réexporter
 * les différents composants de page (Pages) qui constituent les routes de l'application.
 * Cette approche structurelle a pour objectif principal de simplifier la gestion des dépendances
 * au sein du routeur principal et d'améliorer la lisibilité du code.
 * </p>
 * <p>
 * En unifiant les exports via ce fichier d'index, les consommateurs (tels que le fichier de définition
 * des routes <code>App.tsx</code> ou <code>Router.tsx</code>) peuvent importer plusieurs vues via une instruction unique,
 * s'affranchissant ainsi de la connaissance de l'arborescence physique précise des fichiers.
 * Cela favorise la maintenabilité du projet en découplant l'organisation interne du dossier
 * de son utilisation externe.
 * </p>
 */
export { Categories, CategoryDetails, Home, ProductDetails, ProductForm, Products, ShopDetails, ShopForm };
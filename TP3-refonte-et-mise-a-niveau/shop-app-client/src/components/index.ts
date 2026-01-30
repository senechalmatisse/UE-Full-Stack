import ActionButtons from './ActionButtons';
import CategoryCard from './CategoryCard';
import Filters from './Filters';
import Layout from './Layout';
import Loader from './Loader';
import ProductCard from './ProductCard';
import SelectPaginate from './SelectPaginate';
import ShopProducts from './ShopProducts';
import ShopCard from './ShopCard';
import SwitchLanguage from './SwitchLanguage';
import Toaster from './Toaster';

/**
 * Point d'entrée unique (Barrel File) pour le module de composants UI.
 * <p>
 * Ce fichier implémente le patron de conception "Barrel". Son rôle est d'agréger et de réexporter
 * l'ensemble des composants atomiques et moléculaires définis dans ce répertoire.
 * Cette stratégie architecturale offre plusieurs avantages pour la maintenabilité du projet :
 * </p>
 * <ul>
 * <li><strong>Simplification des imports :</strong> Elle permet aux consommateurs de ces composants d'utiliser une syntaxe
 * d'importation unifiée (ex: <code>import { Loader, Layout } from './components';</code>) plutôt que de pointer vers chaque fichier individuel.</li>
 * <li><strong>Encapsulation :</strong> Elle découple la structure interne des fichiers de leur utilisation externe.
 * On peut ainsi renomm/déplacer un fichier composant sans casser les imports dans toute l'application, tant que l'export ici reste constant.</li>
 * <li><strong>Visibilité :</strong> Elle définit explicitement l'API publique du dossier composants.</li>
 * </ul>
 */
export {
    ActionButtons,
    CategoryCard,
    Filters,
    Layout,
    Loader,
    ProductCard,
    SelectPaginate,
    ShopProducts,
    ShopCard,
    SwitchLanguage,
    Toaster,
};
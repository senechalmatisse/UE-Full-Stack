import {
    Categories,
    CategoryDetails,
    Home,
    ProductDetails,
    ProductForm,
    Products,
    ShopDetails,
    ShopForm,
} from '../pages';
import CategoryForm from '../pages/CategoryForm';

/**
 * Définition typée de la structure d'une route applicative.
 * Cette interface contractuelle impose la présence d'un identifiant unique (`name`),
 * d'un schéma d'URL (`path`) pouvant inclure des paramètres dynamiques,
 * et du composant React cible (`element`) à instancier.
 */
type Routes = {
    name: string;
    path: string;
    element: () => JSX.Element;
}[];

/**
 * Référentiel central du plan de routage de l'application.
 * <p>
 * Ce tableau constant définit l'intégralité de l'arborescence de navigation accessible côté client.
 * Il orchestre la correspondance entre les URL du navigateur et les vues fonctionnelles, couvrant
 * les trois domaines métiers principaux : la gestion des Boutiques, des Produits et des Catégories.
 * </p>
 * <p>
 * D'un point de vue architectural, cette configuration met en œuvre une stratégie de mutualisation
 * des composants d'interface. En effet, les formulaires (tels que {@code ShopForm} ou {@code ProductForm})
 * sont associés à deux routes distinctes : l'une statique pour la création (ex: {@code /create}) et l'autre
 * dynamique paramétrée par un ID pour l'édition (ex: {@code /edit/:id}). Cette approche délègue au composant
 * la responsabilité de déterminer son contexte d'exécution (ajout vs modification) lors de l'initialisation.
 * </p>
 */
const routes: Routes = [
    // --- Domaine : Boutiques (Shops) ---
    {
        name: 'Home',
        path: '/',
        element: Home,
    },
    {
        name: 'ShopDetails',
        path: '/shop/:id',
        element: ShopDetails,
    },
    {
        name: 'CreateShop',
        path: '/shop/create',
        element: ShopForm,
    },
    {
        name: 'EditShop',
        path: '/shop/edit/:id',
        element: ShopForm,
    },

    // --- Domaine : Produits (Products) ---
    {
        name: 'Products',
        path: '/product',
        element: Products,
    },
    {
        name: 'ProductDetails',
        path: '/product/:id',
        element: ProductDetails,
    },
    {
        name: 'CreateProduct',
        path: '/product/create',
        element: ProductForm,
    },
    {
        name: 'EditProduct',
        path: '/product/edit/:id',
        element: ProductForm,
    },

    // --- Domaine : Catégories (Categories) ---
    {
        name: 'Categories',
        path: '/category',
        element: Categories,
    },
    {
        name: 'CategoryDetails',
        path: '/category/:id',
        element: CategoryDetails,
    },
    {
        name: 'CreateCategory',
        path: '/category/create',
        element: CategoryForm,
    },
    {
        name: 'EditCategory',
        path: '/category/edit/:id',
        element: CategoryForm,
    },
];

export default routes;
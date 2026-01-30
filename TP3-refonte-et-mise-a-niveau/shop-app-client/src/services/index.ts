import * as CategoryService from './CategoryService';
import * as ProductService from './ProductService';
import * as ShopService from './ShopService';

/**
 * Point d'entrée unique (Barrel File) pour la couche de services applicatifs.
 * <p>
 * Ce fichier implémente le patron de conception "Barrel" pour le répertoire <code>services</code>.
 * Il a pour responsabilité d'agréger et d'exposer les différents modules de communication API
 * (Catégories, Produits, Boutiques) sous forme d'espaces de noms (Namespaces) distincts.
 * </p>
 * <p>
 * Cette stratégie d'exportation (via la syntaxe <code>import * as</code>) permet d'encapsuler
 * les fonctions unitaires de chaque service (ex: <code>get</code>, <code>create</code>, <code>delete</code>)
 * au sein d'un objet conteneur explicite. Ainsi, dans le reste de l'application, les appels API gagnent
 * en sémantique et en lisibilité (ex: l'utilisation de <code>ShopService.getShop()</code> est préférée à
 * une fonction isolée <code>getShop()</code>), tout en évitant les collisions de noms entre les méthodes
 * similaires des différentes entités.
 * </p>
 */
export { CategoryService, ProductService, ShopService };
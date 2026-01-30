import { getLocalizedProduct, formatterLocalizedProduct, formatterProductForm } from './productUtils';
import { pluralize, priceFormatter } from './formatter';

/**
 * Point d'entrée unique (Barrel File) pour la bibliothèque de fonctions utilitaires.
 * <p>
 * Ce module regroupe et réexporte l'ensemble des assistants techniques transverses de l'application.
 * Il agrège les fonctionnalités de deux domaines principaux : le formatage générique (gestion des pluriels,
 * devises) et la manipulation spécifique des structures de données produits (projection i18n, nettoyage de formulaires).
 * </p>
 * <p>
 * L'utilisation de cet index permet de masquer le découpage interne du dossier <code>utils</code>.
 * Ainsi, les composants consommateurs peuvent importer n'importe quel utilitaire depuis un chemin unique,
 * ce qui améliore la lisibilité des imports et facilite le refactoring futur de l'arborescence.
 * </p>
 */
export { formatterLocalizedProduct, formatterProductForm, getLocalizedProduct, pluralize, priceFormatter };
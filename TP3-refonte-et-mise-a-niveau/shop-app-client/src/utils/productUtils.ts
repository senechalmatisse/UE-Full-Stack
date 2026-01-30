import { MinimalLocalizedProduct, MinimalProduct, Product } from '../types/product';
import { LocalizedProduct } from '../types';
import Language from '../types/locale';

/**
 * Mécanisme de résolution de la localisation active.
 * <p>
 * Cette fonction utilitaire parcourt la collection des traductions disponibles pour un produit
 * afin d'extraire l'entrée correspondant à la locale demandée par le contexte utilisateur.
 * Dans une optique de robustesse (Fail-safe), elle implémente une stratégie de repli :
 * si la traduction spécifique n'est pas trouvée, la fonction retourne systématiquement
 * la première entrée disponible (généralement la langue par défaut, le Français),
 * garantissant ainsi qu'aucune donnée vide n'est renvoyée à l'interface.
 * </p>
 *
 * @param localizedProducts Le tableau des données produits localisées.
 * @param locale La clé de langue cible (ex: FR, EN).
 * @returns L'objet de traduction correspondant ou, à défaut, l'entrée par défaut.
 */
export const getLocalizedProduct = (
    localizedProducts: LocalizedProduct[] | MinimalLocalizedProduct[],
    locale: Language,
) => {
    const result = localizedProducts.find((o) => {
        return o.locale === locale;
    });

    return result ?? localizedProducts[0];
};

/**
 * Transformateur de données pour l'affichage (View Model Projection).
 * <p>
 * Cette fonction a pour but d'aplatir la structure hiérarchique du produit pour simplifier sa consommation
 * par les composants visuels. En fusionnant les propriétés localisées (nom et description, résolus selon la langue active)
 * directement à la racine de l'objet produit, elle évite aux vues de devoir gérer la logique de sélection
 * dans le tableau des traductions. Le résultat est un objet hybride optimisé pour le rendu.
 * </p>
 *
 * @param product L'entité produit brute provenant du store ou de l'API.
 * @param locale La langue courante de l'application.
 * @returns Une projection du produit enrichie des champs textuels dans la bonne langue.
 */
export const formatterLocalizedProduct = (product: Product, locale: Language) => {
    const localizedProduct = getLocalizedProduct(product.localizedProducts, locale);
    return { ...product, name: localizedProduct.name, description: localizedProduct.description };
};

/**
 * Processeur de nettoyage des données avant soumission (Payload Sanitization).
 * <p>
 * Avant la transmission des données de formulaire au serveur, cette fonction opère un filtrage strict
 * sur la structure complexe du produit. Elle itère sur les entrées localisées pour éliminer
 * les propriétés vides ou nulles, réduisant ainsi la taille du payload. De plus, elle intègre une règle métier
 * visant à exclure totalement les objets de traduction qui seraient "coquilles vides" (ne contenant aucune donnée significative
 * hormis leur identifiant ou code langue), préservant ainsi l'intégrité et la propreté de la base de données.
 * </p>
 *
 * @param product L'objet produit brut issu du formulaire (DTO).
 * @returns Une copie de l'objet produit avec une liste de traductions optimisée et nettoyée.
 */
export const formatterProductForm = (product: MinimalProduct): MinimalProduct => {
    const results: MinimalLocalizedProduct[] = [];
    const localizedProducts = product.localizedProducts;

    localizedProducts.forEach((localizedProduct) => {
        const reducedLocalizedProduct = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(localizedProduct).filter(([_, v]) => v !== '' && v !== null),
        ) as MinimalLocalizedProduct;

        const nbProperties = Object.keys(reducedLocalizedProduct).length;
        const cond = reducedLocalizedProduct.id ? nbProperties > 2 : nbProperties > 1;
        if (cond) results.push(reducedLocalizedProduct);
    });

    return { ...product, localizedProducts: results };
};
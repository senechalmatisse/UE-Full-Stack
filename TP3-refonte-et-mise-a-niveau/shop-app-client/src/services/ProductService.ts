import axios, { AxiosResponse } from 'axios';
import { MinimalProduct, Product, ResponseArray } from '../types';

/**
 * Service applicatif responsable de la gestion des opérations CRUD pour le domaine "Produits".
 * <p>
 * Ce module centralise l'ensemble des interactions HTTP avec l'API REST concernant les produits.
 * Au-delà du simple transport de données, il joue un rôle crucial de "Médiateur de Données" (Data Mapper)
 * en assurant la conversion bidirectionnelle des formats, notamment pour les valeurs monétaires
 * qui nécessitent un traitement spécifique (Euros vers Centimes) avant persistance.
 * </p>
 */

/**
 * Récupère l'inventaire global des produits avec pagination.
 * <p>
 * Cette méthode interroge le point de terminaison racine pour obtenir une liste exhaustive
 * de toutes les références disponibles, indépendamment de leur boutique d'appartenance.
 * Elle est principalement utilisée pour l'affichage du catalogue administrateur global.
 * </p>
 *
 * @param page Le numéro de la page demandée.
 * @param size La capacité maximale d'éléments par page.
 * @returns Une promesse contenant le tableau paginé de produits.
 */
export function getProducts(
    page: number,
    size: number
): Promise<ResponseArray<Product>> {
    return axios.get(`${process.env.REACT_APP_API}/products?page=${page}&size=${size}`);
}

/**
 * Récupère la liste des produits associés à une boutique spécifique.
 * <p>
 * Cette requête filtrée permet d'isoler le catalogue d'un point de vente donné.
 * Elle est essentielle pour l'affichage de la vue détaillée d'une boutique, permettant
 * de présenter uniquement l'offre commerciale locale.
 * </p>
 *
 * @param shopId L'identifiant de la boutique propriétaire.
 * @param page L'index de pagination.
 * @param size Le nombre d'éléments par page.
 * @returns Une promesse contenant les produits de la boutique cible.
 */
export function getProductsbyShop(
    shopId: string,
    page: number,
    size: number
): Promise<ResponseArray<Product>> {
    return axios.get(`${process.env.REACT_APP_API}/products?shopId=${shopId}&page=${page}&size=${size}`);
}

/**
 * Effectue une recherche multicritère combinant la boutique et la catégorie.
 * <p>
 * Cette fonction offre une granularité de filtrage plus fine, permettant à l'utilisateur
 * d'explorer le rayon (catégorie) spécifique d'une boutique donnée. Elle construit dynamiquement
 * la chaîne de requête (Query String) pour appliquer cette intersection de critères côté serveur.
 * </p>
 *
 * @param shopId L'identifiant de la boutique.
 * @param categoryId L'identifiant numérique de la catégorie.
 * @param page L'index de pagination.
 * @param size Le nombre d'éléments par page.
 * @returns Une promesse contenant les produits correspondants aux deux critères.
 */
export function getProductsbyShopAndCategory(
    shopId: string,
    categoryId: number,
    page: number,
    size: number,
): Promise<ResponseArray<Product>> {
    return axios.get(
        `${process.env.REACT_APP_API}/products?shopId=${shopId}&categoryId=${categoryId}&page=${page}&size=${size}`,
    );
}

/**
 * Charge les informations détaillées d'un produit unique.
 * <p>
 * Permet la récupération de l'objet produit complet via son identifiant unique (UUID).
 * </p>
 *
 * @param id L'identifiant technique du produit.
 * @returns Une promesse résolvant l'entité produit.
 */
export function getProduct(id: string): Promise<AxiosResponse<Product>> {
    return axios.get(`${process.env.REACT_APP_API}/products/${id}`);
}

/**
 * Orchestre la création d'un nouveau produit avec transformation des données.
 * <p>
 * Cette méthode intègre une logique métier critique : la normalisation du prix.
 * Alors que l'interface utilisateur manipule des montants en devise standard (ex: Euros),
 * le backend stocke les valeurs en unités mineures (ex: Centimes) pour éviter les erreurs
 * d'arrondi sur les nombres flottants. Ce service intercepte donc l'objet `MinimalProduct`
 * et multiplie le prix par 100 avant de transmettre la requête POST.
 * </p>
 *
 * @param product L'objet de transfert (DTO) contenant les données saisies par l'utilisateur.
 * @returns La réponse HTTP de création.
 */
export function createProduct(product: MinimalProduct): Promise<AxiosResponse<Product>> {
    const formattedProduct = {
        ...product,
        price: product.price * 100
    };
    return axios.post(`${process.env.REACT_APP_API}/products`, formattedProduct);
}

/**
 * Gère la mise à jour d'un produit existant.
 * <p>
 * Similaire à la création, cette opération applique la règle de conversion monétaire (x100)
 * pour garantir la cohérence des données en base. Elle utilise le verbe HTTP `PUT` pour
 * remplacer l'état de la ressource serveur par les nouvelles valeurs fournies.
 * </p>
 *
 * @param product L'objet produit contenant les modifications et l'ID cible.
 * @returns La réponse HTTP de mise à jour.
 */
export function editProduct(product: MinimalProduct): Promise<AxiosResponse<Product>> {
    const formattedProduct = {
        ...product,
        price: product.price * 100
    };
    return axios.put(`${process.env.REACT_APP_API}/products`, formattedProduct);
}

/**
 * Déclenche la suppression définitive d'un produit.
 *
 * @param id L'identifiant du produit à retirer du catalogue.
 * @returns La réponse HTTP confirmant la suppression.
 */
export function deleteProduct(id: string): Promise<AxiosResponse<Product>> {
    return axios.delete(`${process.env.REACT_APP_API}/products/${id}`);
}
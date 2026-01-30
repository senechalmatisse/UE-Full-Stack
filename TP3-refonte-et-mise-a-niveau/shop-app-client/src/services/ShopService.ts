import { MinimalShop } from './../types/shop';
import axios, { AxiosResponse } from 'axios';
import { Shop } from '../types';
import { ResponseArray } from '../types/response';

/**
 * Service applicatif assurant l'interface avec l'API REST pour la gestion des Boutiques.
 * <p>
 * Ce module centralise l'intégralité des transactions HTTP relatives à l'entité {@link Shop}.
 * Il propose une abstraction complète des opérations CRUD (Create, Read, Update, Delete) ainsi que
 * des fonctionnalités de recherche avancée. L'objectif architectural est de découpler les composants
 * visuels de la logique réseau, permettant une maintenance simplifiée des points de terminaison (endpoints)
 * configurés via les variables d'environnement.
 * </p>
 */

/**
 * Récupère la liste standard des boutiques avec pagination.
 * <p>
 * Cette méthode interroge l'endpoint racine pour obtenir une vue non filtrée de l'annuaire des boutiques.
 * Elle est généralement utilisée pour l'affichage initial ou la navigation simple dans le catalogue.
 * </p>
 *
 * @param page Le numéro de la page courante.
 * @param size Le nombre d'éléments à afficher par page.
 * @returns Une promesse contenant la liste paginée des boutiques.
 */
export function getShops(page: number, size: number): Promise<ResponseArray<Shop>> {
    return axios.get(`${process.env.REACT_APP_API}/shops?page=${page}&size=${size}`);
}

/**
 * Récupère une liste de boutiques triée selon un critère spécifique.
 * <p>
 * Cette variante de la récupération injecte un paramètre `sortBy` dans la requête GET.
 * Elle permet au serveur d'ordonner les résultats (par exemple par nom, date de création ou volume de produits)
 * avant de retourner la tranche paginée, répondant ainsi aux besoins de tri côté interface utilisateur.
 * </p>
 *
 * @param page Le numéro de la page.
 * @param size La taille de la page.
 * @param sort Le nom du champ sur lequel appliquer le tri.
 * @returns Une promesse contenant la liste des boutiques triées.
 */
export function getShopsSorted(
    page: number,
    size: number,
    sort: string
): Promise<ResponseArray<Shop>> {
    return axios.get(`${process.env.REACT_APP_API}/shops?page=${page}&size=${size}&sortBy=${sort}`);
}

/**
 * Exécute une recherche complexe multicritère.
 * <p>
 * Cette fonction offre la flexibilité maximale pour l'exploration du catalogue. Elle accepte une chaîne
 * de paramètres URL pré-construite (`urlFilters`) qui peut contenir une combinaison arbitraire de filtres
 * (recherche textuelle, dates, statuts). Cette approche permet de relayer directement les critères
 * complexes générés par le composant de filtrage vers le moteur de recherche du backend.
 * </p>
 *
 * @param page Le numéro de la page.
 * @param size La taille de la page.
 * @param urlFilters La chaîne de requête concaténée (ex: "&search=Paris&inVacations=true").
 * @returns Une promesse contenant les résultats filtrés.
 */
export function getShopsFiltered(
    page: number,
    size: number,
    urlFilters: string
): Promise<ResponseArray<Shop>> {
    return axios.get(`${process.env.REACT_APP_API}/shops?page=${page}&size=${size}${urlFilters}`);
}

/**
 * Charge les données détaillées d'une boutique spécifique.
 * <p>
 * Permet d'obtenir l'objet complet (incluant potentiellement des relations chargées à la demande)
 * via son identifiant unique.
 * </p>
 *
 * @param id L'identifiant technique de la boutique.
 * @returns Une réponse Axios contenant l'entité Shop.
 */
export function getShop(id: string): Promise<AxiosResponse<Shop>> {
    return axios.get(`${process.env.REACT_APP_API}/shops/${id}`);
}

/**
 * Persiste une nouvelle boutique dans la base de données.
 * <p>
 * Cette méthode envoie un objet de transfert (DTO) `MinimalShop` via une requête POST.
 * Elle inclut la gestion des données imbriquées, telles que les horaires d'ouverture initiaux,
 * qui seront traités transactionnellement par le serveur lors de la création.
 * </p>
 *
 * @param shop Les données de la boutique à créer.
 * @returns La confirmation de création avec l'entité finale.
 */
export function createShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    return axios.post(`${process.env.REACT_APP_API}/shops`, shop);
}

/**
 * Met à jour les informations d'une boutique existante.
 * <p>
 * Utilise le verbe PUT pour soumettre l'état modifié de la boutique. L'objet transmis doit
 * contenir l'ensemble des informations nécessaires à la mise à jour, l'identifiant étant
 * généralement encapsulé dans le corps de la requête ou déduit du contexte.
 * </p>
 *
 * @param shop L'objet boutique modifié.
 * @returns La confirmation de mise à jour.
 */
export function editShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    return axios.put(`${process.env.REACT_APP_API}/shops`, shop);
}

/**
 * Supprime définitivement une boutique du système.
 * <p>
 * Cette opération irréversible est déclenchée via l'identifiant de la ressource.
 * Elle entraîne généralement la suppression en cascade ou le détachement des produits associés,
 * selon les règles d'intégrité définies côté serveur.
 * </p>
 *
 * @param id L'identifiant de la boutique à supprimer.
 * @returns La confirmation de la suppression.
 */
export function deleteShop(id: string): Promise<AxiosResponse<Shop>> {
    return axios.delete(`${process.env.REACT_APP_API}/shops/${id}`);
}
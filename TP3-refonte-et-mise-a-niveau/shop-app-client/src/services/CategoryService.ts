import axios, { AxiosResponse } from 'axios';
import { Category, MinimalCategory, ResponseArray } from '../types';

/**
 * Service applicatif dédié à la gestion des transactions HTTP pour le domaine "Catégories".
 * <p>
 * Ce module agit comme une couche d'abstraction (Service Layer) entre l'interface utilisateur et l'API REST.
 * Il centralise l'intégralité des appels réseau (CRUD), garantissant ainsi un couplage faible
 * et facilitant la maintenance des points de terminaison. L'URL de base est injectée dynamiquement
 * via les variables d'environnement (`process.env.REACT_APP_API`), permettant une configuration flexible
 * selon l'environnement de déploiement.
 * </p>
 */

/**
 * Récupère la liste paginée des catégories disponibles.
 * <p>
 * Cette fonction effectue une requête `GET` en transmettant les paramètres de pagination (`page` et `size`)
 * dans la chaîne de requête (Query String). Elle retourne une promesse résolvant une structure de réponse
 * standardisée contenant à la fois le tableau de données et les métadonnées de navigation (nombre de pages, total d'éléments).
 * </p>
 *
 * @param page L'index de la page demandée (base 0 généralement, selon l'implémentation backend).
 * @param size Le nombre d'éléments souhaités par page.
 * @returns Une promesse contenant la liste typée des catégories.
 */
export function getCategories(
    page: number,
    size: number
): Promise<ResponseArray<Category>> {
    return axios.get(`${process.env.REACT_APP_API}/categories?page=${page}&size=${size}`);
}

/**
 * Extrait les détails d'une ressource "Catégorie" spécifique.
 * <p>
 * En ciblant l'URL canonique de la ressource via son identifiant unique, cette méthode permet
 * de récupérer l'objet complet nécessaire à l'affichage de la vue détaillée ou à l'initialisation
 * du formulaire d'édition.
 * </p>
 *
 * @param id L'identifiant technique (UUID) de la catégorie cible.
 * @returns Une promesse contenant l'objet catégorie.
 */
export function getCategory(id: string): Promise<AxiosResponse<Category>> {
    return axios.get(`${process.env.REACT_APP_API}/categories/${id}`);
}

/**
 * Orchestre la persistance d'une nouvelle catégorie.
 * <p>
 * Cette fonction transmet un objet de transfert de données (DTO) allégé (`MinimalCategory`),
 * dépourvu des champs d'audit (ID, dates), via une requête `POST`. C'est le serveur qui aura
 * la responsabilité de générer l'identifiant et d'horodater la création.
 * </p>
 *
 * @param category L'objet contenant les données utiles à la création.
 * @returns La réponse HTTP contenant l'entité nouvellement créée.
 */
export function createCategory(
    category: MinimalCategory
): Promise<AxiosResponse<Category>> {
    return axios.post(`${process.env.REACT_APP_API}/categories`, category);
}

/**
 * Assure la mise à jour des informations d'une catégorie existante.
 * <p>
 * Cette opération s'effectue via le verbe HTTP `PUT`, impliquant généralement le remplacement
 * intégral de la ressource. L'objet `MinimalCategory` transmis doit contenir les données
 * modifiées prêtes à être persistées.
 * </p>
 *
 * @param category L'objet catégorie portant les modifications.
 * @returns La réponse HTTP confirmant la mise à jour.
 */
export function editCategory(
    category: MinimalCategory
): Promise<AxiosResponse<Category>> {
    return axios.put(`${process.env.REACT_APP_API}/categories`, category);
}

/**
 * Pilote la suppression physique d'une catégorie.
 * <p>
 * Cette méthode invoque le point de terminaison `DELETE` en ciblant la ressource par son identifiant.
 * Elle est utilisée pour retirer définitivement une catégorie du référentiel.
 * </p>
 *
 * @param id L'identifiant technique de la catégorie à supprimer.
 * @returns La réponse HTTP confirmant la suppression.
 */
export function deleteCategory(id: string): Promise<AxiosResponse<Category>> {
    return axios.delete(`${process.env.REACT_APP_API}/categories/${id}`);
}
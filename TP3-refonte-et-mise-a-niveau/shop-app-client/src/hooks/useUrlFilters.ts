import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

/**
 * Structure de données modélisant l'ensemble des critères de filtrage applicables.
 */
export type FiltersType = {
    inVacations: string;
    createdAfter: Dayjs | null;
    createdBefore: Dayjs | null;
};

/**
 * Interface définissant le contrat de retour du hook personnalisé.
 * Elle expose les filtres actuels ainsi que la fonction de mise à jour synchronisée avec l'URL.
 */
interface UseUrlFiltersReturn {
    filters: FiltersType;
    updateFilters: (newFilters: FiltersType) => void;
}

/**
 * Hook personnalisé assurant la synchronisation bidirectionnelle entre l'état des filtres et les paramètres d'URL.
 * 
 * <p>
 * Ce hook implémente le principe de Responsabilité Unique (SRP) en se concentrant exclusivement
 * sur la gestion de la persistance des filtres dans l'URL. Il offre deux fonctionnalités essentielles :
 * 
 * 1. **Hydratation depuis l'URL** : Au montage du composant, il parse les paramètres de requête
 *    pour reconstruire l'état des filtres, permettant ainsi la navigation avec signets (bookmarks)
 *    et le partage de liens filtrés.
 * 
 * 2. **Synchronisation vers l'URL** : Lors de chaque modification des filtres, il met à jour
 *    automatiquement l'URL sans déclencher de rechargement complet de la page, grâce à l'API
 *    History de React Router.
 * </p>
 * 
 * <p>
 * Cette approche découple la logique de persistance URL de la logique métier des composants,
 * facilitant ainsi la testabilité et la réutilisabilité du code.
 * 
 * @returns Un objet contenant les filtres actuels et la fonction de mise à jour.
 */
export const useUrlFilters = (): UseUrlFiltersReturn => {
    const [searchParams, setSearchParams] = useSearchParams();

    /**
     * Extrait et désérialise les filtres depuis les paramètres d'URL.
     * Cette fonction pure transforme les chaînes de requête en objets typés,
     * en gérant la conversion des dates ISO en objets Dayjs.
     */
    const getFiltersFromUrl = (): FiltersType => {
        return {
            inVacations: searchParams.get('inVacations') || '',
            createdAfter: searchParams.get('createdAfter') 
                ? dayjs(searchParams.get('createdAfter')) 
                : null,
            createdBefore: searchParams.get('createdBefore') 
                ? dayjs(searchParams.get('createdBefore')) 
                : null,
        };
    };

    const [filters, setFilters] = useState<FiltersType>(getFiltersFromUrl);

    /**
     * Synchronise l'état local avec les paramètres d'URL au montage du composant.
     * Ce hook garantit que les filtres affichés correspondent toujours à l'URL active,
     * même en cas de navigation via le bouton "Précédent" du navigateur.
     */
    useEffect(() => {
        setFilters(getFiltersFromUrl());
    }, [searchParams]);

    /**
     * Met à jour simultanément l'état local et les paramètres d'URL.
     * 
     * <p>
     * Cette fonction implémente une stratégie de nettoyage des paramètres : seuls les filtres
     * ayant une valeur effective sont ajoutés à l'URL, évitant ainsi la pollution de la
     * chaîne de requête avec des paramètres vides ou null.
     * 
     * @param newFilters Les nouveaux critères de filtrage à appliquer.
     */
    const updateFilters = (newFilters: FiltersType) => {
        setFilters(newFilters);
        const params = new URLSearchParams();

        if (newFilters.inVacations) {
            params.set('inVacations', newFilters.inVacations);
        }

        if (newFilters.createdAfter) {
            params.set('createdAfter', newFilters.createdAfter.format('YYYY-MM-DD'));
        }

        if (newFilters.createdBefore) {
            params.set('createdBefore', newFilters.createdBefore.format('YYYY-MM-DD'));
        }

        setSearchParams(params, { replace: true });
    };

    return { filters, updateFilters };
};
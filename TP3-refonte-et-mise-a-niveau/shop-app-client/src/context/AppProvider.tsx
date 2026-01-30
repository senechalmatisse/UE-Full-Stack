import { createContext, useContext, useState } from 'react';
import Locale from '../types/locale';

/**
 * Contrat d'interface définissant la structure de l'état global de l'application.
 * <p>
 * Cette interface typée décrit l'ensemble des données et des mutateurs (setters) accessibles
 * depuis n'importe quel composant de l'arborescence. Elle regroupe deux aspects transverses essentiels :
 * le contrôle de l'indicateur de chargement global (`loading`) et la gestion de la locale active (`locale`)
 * pour l'internationalisation.
 * </p>
 */
interface AppContextInterface {
    loading: boolean;
    setLoading: (load: boolean) => void;
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

/**
 * Initialisation du contexte React avec des valeurs par défaut de sécurité.
 * <p>
 * Ce contexte sert de canal de communication pour propager l'état global sans avoir recours
 * au passage de propriétés en cascade (Prop Drilling). Les fonctions vides fournies par défaut
 * garantissent que le contexte peut être consommé sans provoquer d'erreurs d'exécution,
 * même dans l'éventualité (théorique) où un composant serait rendu hors de la portée du Provider.
 * </p>
 */
const AppContext = createContext<AppContextInterface>({
    loading: false,
    setLoading: () => {
        // Fonction vide par défaut (placeholder)
    },
    locale: Locale.FR,
    setLocale: () => {
        // Fonction vide par défaut (placeholder)
    },
});

type Props = {
    children: JSX.Element;
};

/**
 * Composant fournisseur (Provider) responsable de la détention et de la diffusion de l'état global.
 * <p>
 * Ce composant enveloppe l'intégralité de l'application (généralement au niveau racine).
 * Il instancie les véritables états réactifs via le hook {@link useState} et les expose
 * à travers le `AppContext.Provider`. C'est ici que réside la "source de vérité" unique
 * pour la langue de l'interface et l'état de chargement.
 * </p>
 *
 * @param children Les composants enfants qui auront accès au contexte (toute l'application).
 * @returns Le Provider injectant les valeurs d'état et les fonctions de mise à jour dans l'arbre des composants.
 */
export function AppProvider({ children }: Props) {
    // État local pilotant l'affichage du Loader global (Spinner/Backdrop)
    const [loading, setLoading] = useState<boolean>(false);

    // État local stockant la langue active (Français par défaut)
    const [locale, setLocale] = useState<Locale>(Locale.FR);

    return (
        <AppContext.Provider
            value={{
                loading,
                setLoading,
                locale,
                setLocale,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

/**
 * Hook personnalisé facilitant la consommation du contexte applicatif.
 * <p>
 * Cette abstraction encapsulation l'appel à {@link useContext}. Elle permet aux composants consommateurs
 * d'accéder aux données globales (loading, locale) et à leurs modificateurs via une syntaxe concise,
 * sans avoir à importer directement l'objet `AppContext` brut.
 * </p>
 *
 * @returns L'objet contexte contenant l'état actuel et les fonctions de mise à jour.
 */
export const useAppContext = () => useContext(AppContext);
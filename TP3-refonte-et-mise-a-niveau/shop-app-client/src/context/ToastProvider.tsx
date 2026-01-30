import { createContext, useContext, useState } from 'react';
import { Toaster } from '../components';
import { Toast } from '../types';

/**
 * Contrat d'interface définissant les capacités du système de notification.
 * <p>
 * Cette interface expose uniquement la méthode de mutation {@code setToast}.
 * Elle permet aux composants consommateurs de déclencher l'apparition d'une alerte (Toast)
 * sans avoir besoin de connaître l'état interne ou la logique d'affichage sous-jacente.
 * </p>
 */
interface ToastContextInterface {
    setToast: (toast: Toast) => void;
}

/**
 * Initialisation du contexte de notification.
 * <p>
 * Définit la structure par défaut du contexte avec une fonction "no-op" (opération vide).
 * Cette précaution évite les erreurs d'exécution (Runtime Errors) si un composant tente
 * d'accéder au contexte en dehors de la portée du {@link ToastProvider}.
 * </p>
 */
const ToastContext = createContext<ToastContextInterface>({
    setToast: () => {
        // Fonction vide par défaut (Pattern Null Object)
    },
});

type Props = {
    children: JSX.Element;
};

/**
 * Composant fournisseur (Provider) orchestrant l'affichage global des notifications.
 * <p>
 * Ce composant joue un double rôle architectural :
 * 1. **Gestion d'état :** Il maintient l'état de la notification courante (message et sévérité) via le hook {@link useState}.
 * 2. **Rendu UI Centralisé :** Contrairement à d'autres providers qui ne font que passer des données, celui-ci
 * instancie physiquement le composant visuel {@link Toaster} au niveau racine.
 * </p>
 * <p>
 * Cette approche permet de découpler totalement la logique métier (déclencher une alerte) de la logique de présentation.
 * Les composants enfants n'ont pas besoin d'inclure de balise de notification dans leur JSX ; ils se contentent
 * d'invoquer la méthode {@code setToast} exposée par le contexte.
 * </p>
 *
 * @param children L'arborescence de composants de l'application à envelopper.
 * @returns Le Provider injectant la méthode de contrôle, accompagné du composant d'affichage Toaster.
 */
export function ToastProvider({ children }: Props) {
    // État local stockant la configuration de la dernière notification demandée
    const [toast, setToast] = useState<Toast>({
        severity: 'success',
        message: '',
    });

    return (
        <ToastContext.Provider
            value={{
                setToast,
            }}
        >
            {children}
            {/* Injection unique du composant d'affichage au niveau global */}
            <Toaster toast={toast} />
        </ToastContext.Provider>
    );
}

/**
 * Hook personnalisé facilitant la consommation du service de notification.
 * <p>
 * Cette abstraction permet aux développeurs d'accéder à la fonction {@code setToast}
 * de manière concise via {@code useToastContext()}, sans importer manuellement l'objet contexte.
 * </p>
 *
 * @returns L'interface de contrôle du ToastContext.
 */
export const useToastContext = () => useContext(ToastContext);
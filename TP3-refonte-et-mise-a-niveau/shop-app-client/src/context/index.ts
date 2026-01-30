import { AppProvider, useAppContext } from './AppProvider';
import myTheme from './ThemeProvider';
import { ToastProvider, useToastContext } from './ToastProvider';

/**
 * Point d'entrée unique (Barrel File) pour le module de contexte et de configuration globale.
 * <p>
 * Ce fichier implémente le patron de conception "Barrel" afin de centraliser et d'uniformiser
 * l'exposition des composants de gestion d'état (Providers), des hooks personnalisés associés
 * et de la configuration du thème graphique.
 * </p>
 * <p>
 * En agissant comme une façade pour le répertoire <code>context</code>, il permet de découpler
 * l'architecture interne des fichiers de leur consommation par le reste de l'application.
 * Par conséquent, les modules importateurs bénéficient d'une syntaxe simplifiée et stable,
 * s'affranchissant de la connaissance précise de l'emplacement physique de chaque ressource exportée.
 * </p>
 */
export { AppProvider, useAppContext, myTheme, ToastProvider, useToastContext };
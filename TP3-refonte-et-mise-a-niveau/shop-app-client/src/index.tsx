import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Point d'entrée technique assurant l'amorçage (bootstrapping) de l'application React.
 * <p>
 * Ce script réalise la jonction critique entre le DOM du navigateur (Document Object Model) et le
 * DOM Virtuel géré par le framework. En ciblant l'élément conteneur HTML racine (identifié par 'root'),
 * il instancie le moteur de rendu via l'API <code>createRoot</code>. L'utilisation de cette méthode spécifique,
 * en remplacement de l'ancien <code>ReactDOM.render</code>, marque l'activation explicite des fonctionnalités
 * de rendu concurrent (Concurrent Mode) introduites avec React 18, optimisant ainsi les performances de mise à jour.
 * </p>
 * <p>
 * L'injection de l'arbre de composants débute par le composant racine <code>App</code>, encapsulé ici
 * dans une balise <code>React.StrictMode</code>. Ce wrapper, actif uniquement en environnement de développement,
 * ne produit aucun rendu visible mais déclenche des vérifications supplémentaires (double invocation des effets,
 * détection d'API obsolètes) afin de garantir la robustesse et la pérennité du code.
 * </p>
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
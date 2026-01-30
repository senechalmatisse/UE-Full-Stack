/**
 * Définition structurelle de l'objet de notification système.
 * <p>
 * Ce type TypeScript établit le contrat de données utilisé pour véhiculer les messages de feedback
 * à l'utilisateur (Toast Notifications). Il est consommé principalement par le contexte global
 * <code>ToastContext</code> pour déclencher l'affichage des alertes éphémères au sein de l'interface.
 * </p>
 * <p>
 * La robustesse de cette définition repose sur l'utilisation d'un type union littéral pour la propriété
 * <code>severity</code>. En restreignant strictement les valeurs possibles à 'success' ou 'error',
 * le système empêche les erreurs de typographie lors de l'appel aux notifications et garantit
 * que le composant visuel recevra toujours un état de style valide (vert pour le succès, rouge pour l'erreur),
 * renforçant ainsi la fiabilité du retour utilisateur.
 * </p>
 */
type Toast = {
    severity: 'success' | 'error';
    message: string;
};

export default Toast;
import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { Toast } from '../types';

/**
 * Contrat de données d'entrée pour le composant de notification.
 * <p>
 * Cette définition de type impose la transmission d'un objet {@link Toast} complet.
 * Cet objet agit comme un conteneur d'état, transportant à la fois le contenu textuel du message
 * et son niveau de criticité (sévérité), déterminant ainsi la couleur et l'icône de l'alerte affichée.
 * </p>
 */
type Props = {
    toast: Toast;
};

/**
 * Composant d'interface utilisateur responsable de l'affichage des notifications éphémères.
 * <p>
 * Ce module joue un rôle essentiel dans l'expérience utilisateur (UX) en fournissant un retour visuel immédiat
 * suite aux actions effectuées (ex: confirmation de sauvegarde, erreur réseau). Techniquement, il encapsule
 * les composants {@link Snackbar} et {@link Alert} de la librairie Material UI.
 * </p>
 * <p>
 * Son comportement est entièrement réactif : il surveille les changements de la propriété `toast` via un hook d'effet.
 * Dès qu'un nouveau message est détecté, le composant bascule automatiquement son état interne pour rendre
 * la notification visible, garantissant ainsi que l'utilisateur est informé en temps réel sans intervention manuelle.
 * </p>
 *
 * @param toast L'objet de configuration de la notification courante.
 * @returns Le rendu conditionnel de la notification ou un élément invisible.
 */
const Toaster = ({ toast }: Props) => {
    // Déstructuration des propriétés pour isoler le style (severity) et le contenu (message)
    const { severity, message } = toast;
    const [open, setOpen] = useState<boolean>(false);

    /**
     * Synchronisation réactive de la visibilité.
     * <p>
     * Ce hook d'effet est déclenché à chaque modification de l'objet `toast` entrant.
     * Il vérifie la présence effective d'un message avant de forcer l'ouverture du composant (`setOpen(true)`).
     * Cette logique permet d'utiliser le même composant pour afficher successivement plusieurs messages
     * sans avoir à le démonter/remonter.
     * </p>
     */
    useEffect(() => {
        message && setOpen(true);
    }, [toast]);

    /**
     * Gestionnaire de fermeture de la notification.
     * <p>
     * Cette méthode pilote la disparition de l'alerte. Elle filtre spécifiquement l'événement 'clickaway'
     * (clic en dehors de la zone) pour empêcher une fermeture accidentelle. La notification ne se ferme
     * que sur une action explicite (clic sur la croix) ou après l'écoulement du délai automatique.
     * </p>
     *
     * @param event L'événement source (optionnel).
     * @param reason La cause de la demande de fermeture.
     */
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Toaster;
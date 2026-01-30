import { Box, Fab } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

/**
 * Contrat d'interface définissant les interactions disponibles pour le composant.
 * * Cette définition de type impose la fourniture de deux fonctions de rappel (callbacks) distinctes.
 * En déléguant la logique métier au composant parent via ces méthodes, ce composant reste purement
 * présentationnel et agnostique quant aux actions réelles (navigation, appel API, ouverture de modale)
 * déclenchées par l'utilisateur.
 */
type Props = {
    handleEdit: () => void;
    handleDelete: () => void;
};

/**
 * Composant d'interface utilisateur regroupant les actions d'administration rapides.
 * * Ce composant fonctionnel rend un conteneur flottant comprenant deux boutons d'action standardisés : 
 * l'édition et la suppression. Conçu pour être intégré au sein de cartes (Cards) ou de conteneurs 
 * d'éléments, il utilise une stratégie de positionnement absolu (`position: absolute`) pour se fixer 
 * dans le coin supérieur droit de son parent. Par conséquent, il est impératif que le conteneur parent 
 * possède une position relative pour servir de référentiel.
 * * Sur le plan visuel, l'utilisation des composants `Fab` (Floating Action Button) de la librairie 
 * Material UI, configurés en taille réduite ("small"), permet de proposer des actions claires 
 * sans obstruer le contenu principal de l'élément sous-jacent.
 * @param props Les propriétés contenant les gestionnaires d'événements pour l'édition et la suppression.
 * @returns Un élément JSX positionné contenant les deux boutons d'action.
 */
const ActionButtons = ({ handleEdit, handleDelete }: Props) => (
    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <Fab size="small" color="primary" aria-label="edit" onClick={handleEdit} sx={{ mr: 1 }}>
            <EditIcon />
        </Fab>
        <Fab size="small" color="primary" aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
        </Fab>
    </Box>
);

export default ActionButtons;
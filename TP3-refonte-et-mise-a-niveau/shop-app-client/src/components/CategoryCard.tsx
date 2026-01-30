import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';

/**
 * Contrat de données définissant les propriétés requises pour l'affichage de la carte.
 * * Cette interface impose la fourniture d'un objet complet de type `Category`.
 * Cet objet est utilisé non seulement pour l'affichage des informations textuelles (comme le nom),
 * mais également pour extraire l'identifiant technique nécessaire à la construction de l'URL de redirection.
 */
type Props = {
    category: Category;
};

/**
 * Composant de présentation affichant une catégorie sous forme de tuile interactive.
 * * Ce composant encapsule la logique d'affichage d'une entité "Catégorie" en utilisant les composants
 * de surface de Material UI (`Card`). Il a pour double responsabilité de présenter le nom de la catégorie
 * de manière centrée et d'agir comme un point de navigation.
 * * L'intégralité de la surface de la carte est rendue interactive (`cursor: 'pointer'`) et réagit au clic
 * en déclenchant une navigation programmatique vers la vue détaillée correspondante, facilitant ainsi
 * l'exploration du catalogue par l'utilisateur.
 * * @param props Les propriétés du composant contenant l'objet catégorie.
 * @returns Un élément JSX représentant la carte cliquable.
 */
const CategoryCard = ({ category }: Props) => {
    /**
     * Hook de routage permettant de manipuler l'historique de navigation.
     * Il est utilisé ici pour rediriger l'utilisateur vers l'URL dynamique `/category/{id}` lors du clic.
     */
    const navigate = useNavigate();

    return (
        <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/category/${category.id}`)}>
            <CardContent>
                <Typography variant="h5" color="text.primary" sx={{ textAlign: 'center' }}>
                    {category.name}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CategoryCard;
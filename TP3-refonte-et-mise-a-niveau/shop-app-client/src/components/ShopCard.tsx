import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { pluralize } from '../utils';

/**
 * Interface définissant les dépendances de données du composant.
 * <p>
 * Ce contrat impose la fourniture d'un objet métier {@link Shop} complet.
 * Cet objet sert de source unique pour l'ensemble des informations affichées (nom, métriques, dates)
 * ainsi que pour la génération du lien de navigation (via l'identifiant technique).
 * </p>
 */
type Props = {
    shop: Shop;
};

/**
 * Composant de présentation affichant les informations synthétiques d'une boutique.
 * <p>
 * Ce module est conçu pour être intégré au sein de listes ou de grilles de résultats.
 * Il assure le rendu visuel d'une entité "Boutique" sous forme de carte interactive (Card).
 * Sur le plan ergonomique, l'intégralité de la surface du composant est active : un clic utilisateur
 * déclenche une redirection immédiate vers la vue détaillée de la boutique concernée via le hook {@code useNavigate}.
 * </p>
 * <p>
 * En outre, ce composant intègre une couche de présentation logique pour le formatage des données brutes.
 * Il utilise la librairie {@code moment.js} pour convertir les timestamps techniques en dates lisibles (DD/MM/YYYY)
 * et s'appuie sur l'utilitaire {@code pluralize} pour accorder grammaticalement les libellés des compteurs
 * (produits et catégories) en fonction de leur volumétrie.
 * </p>
 *
 * @param props L'objet boutique contenant les données à visualiser.
 * @returns Un élément JSX représentant la carte cliquable.
 */
const ShopCard = ({ shop }: Props) => {
    const navigate = useNavigate();

    /**
     * Gestionnaire d'événement pilotant la navigation.
     * Cette fonction encapsule la logique de routage pour rediriger l'utilisateur
     * vers l'URL canonique de la boutique (ex: /shop/12) lors de l'interaction.
     */
    const handleClick = () => {
        navigate(`/shop/${shop.id}`);
    };

    return (
        <Card sx={{ minWidth: 275, cursor: 'pointer' }} onClick={handleClick}>
            <CardContent>
                <Typography variant="h4" color="text.primary" gutterBottom sx={{ textAlign: 'center' }}>
                    {shop.name}
                </Typography>

                {/* Affichage des métriques avec gestion dynamique du pluriel */}
                <Typography variant="h6">
                    {shop.nbProducts} {pluralize('produit', shop.nbProducts)}
                </Typography>
                <Typography variant="h6">
                    {shop.nbProducts} {pluralize('catégorie', shop.nbCategories)}
                </Typography>

                {/* Formatage de la date de création au format français */}
                <Typography sx={{ my: 1.5 }} color="text.secondary">
                    Créée le : {moment(shop.createdAt).format('DD/MM/YYYY')}
                </Typography>

                {/* Traduction visuelle du booléen de statut */}
                <Typography>En congé : {shop.inVacations ? 'oui' : 'non'}</Typography>
            </CardContent>
        </Card>
    );
};

export default ShopCard;
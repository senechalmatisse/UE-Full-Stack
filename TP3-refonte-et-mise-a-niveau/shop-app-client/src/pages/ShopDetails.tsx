import { Box, Paper, Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionButtons, ShopProducts } from '../components';
import { ShopService } from '../services';
import { Shop } from '../types';
import { useAppContext, useToastContext } from '../context';
import { pluralize } from '../utils';

/**
 * Dictionnaire de mappage statique assurant la correspondance entre l'index numérique d'un jour
 * (tel que stocké en base de données) et sa représentation textuelle en français.
 * Cette constante est utilisée pour le rendu lisible des horaires d'ouverture.
 */
const DAY: Record<number, string> = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    7: 'Dimanche',
};

/**
 * Vue détaillée dédiée à la présentation complète d'un point de vente.
 * <p>
 * Ce composant centralise l'affichage de l'ensemble des données relatives à une boutique spécifique.
 * Il structure l'information en trois blocs distincts : les métadonnées administratives (statut, dates, compteurs),
 * la grille des horaires d'ouverture et, par composition, l'inventaire des produits associés via le composant {@link ShopProducts}.
 * </p>
 * <p>
 * Sur le plan technique, ce module implémente une logique de post-traitement des données : lors de la récupération
 * de la boutique, les horaires d'ouverture sont triés chronologiquement côté client pour garantir un affichage
 * cohérent de la semaine (Lundi au Dimanche), indépendamment de l'ordre de réception de l'API.
 * </p>
 */
const ShopDetails = () => {
    // Extraction de l'identifiant de la boutique depuis l'URL
    const { id } = useParams();
    const navigate = useNavigate();

    // Hooks de contexte pour le feedback utilisateur (Loader et Toast)
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();

    const [shop, setShop] = useState<Shop | null>(null);

    /**
     * Récupère et prépare les données de la boutique.
     * <p>
     * Outre l'appel API standard, cette méthode effectue une opération de tri sur le tableau `openingHours`.
     * Cette étape est nécessaire pour assurer que les jours s'affichent dans l'ordre naturel (1 à 7),
     * corrigeant ainsi tout désordre potentiel issu de la base de données.
     * </p>
     *
     * @param shopId L'identifiant technique de la boutique.
     */
    const getShop = (shopId: string) => {
        ShopService.getShop(shopId).then((res) => {
            res.data.openingHours = res.data.openingHours.sort((a, b) => a.day - b.day);
            setShop(res.data);
        });
    };

    /**
     * Synchronisation du cycle de vie.
     * Déclenche le chargement des informations dès que le composant est monté avec un ID valide.
     */
    useEffect(() => {
        id && getShop(id);
    }, [id]);

    /**
     * Formateur utilitaire pour l'affichage des heures.
     * Normalise les chaînes de temps (ex: "09:00:00") au format court "HH:mm".
     */
    const displayHours = (hours: string): string => {
        return moment(hours, 'HH:mm').format('HH:mm');
    };

    /**
     * Gère la suppression de la boutique courante.
     * <p>
     * Cette procédure transactionnelle sécurise l'interface via un indicateur de chargement,
     * exécute la suppression et redirige l'utilisateur vers la liste principale en cas de succès,
     * tout en fournissant un retour visuel via le système de notifications (Toaster).
     * </p>
     */
    const handleDelete = () => {
        setLoading(true);
        id &&
            ShopService.deleteShop(id)
                .then(() => {
                    navigate('/');
                    setToast({ severity: 'success', message: 'La boutique a bien été supprimée' });
                })
                .catch(() => {
                    setToast({ severity: 'error', message: 'Une erreur est survenue lors de la suppresion' });
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    /**
     * Redirige vers le formulaire d'édition de la boutique.
     */
    const handleEdit = () => {
        navigate(`/shop/edit/${id}`);
    };

    // Interruption du rendu tant que les données ne sont pas chargées
    if (!shop) return <></>;

    return (
        <Paper
            elevation={1}
            sx={{
                position: 'relative',
                padding: 4,
            }}
        >
            {/* Injection des boutons d'action (Modifier/Supprimer) */}
            <ActionButtons handleDelete={handleDelete} handleEdit={handleEdit} />

            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                    mt: { xs: 5, sm: 0 }, 
                    marginBottom:3 
                }}
            >
                {shop.name}
            </Typography>

            {/* Affichage des métriques avec gestion grammaticale du pluriel */}
            <Typography variant="h6">
                Cette boutique comporte {shop.nbProducts} {pluralize('produit', shop.nbProducts)}
            </Typography>
            <Typography variant="h6">
                Cette boutique comporte {shop.nbCategories} {pluralize('catégorie', shop.nbCategories)}
            </Typography>

            <Typography sx={{ my: 1 }}>
                {shop.inVacations ? 'En congé actuellement' : "N'est pas en congé actuellement"}
            </Typography>
            <Typography sx={{ my: 1 }} color="text.secondary">
                Boutique créée le : {moment(shop.createdAt).format('DD/MM/YYYY')}
            </Typography>

            {/* Section des horaires d'ouverture */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 4,
                }}
            >
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Horaires d&apos;ouverture :
                </Typography>
                {shop.openingHours.map((openingHour) => (
                    <Box
                        key={openingHour.id}
                        sx={{
                            width: 200,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Conversion de l'index jour en libellé via la constante DAY */}
                        <Typography sx={{ mb: 1.5 }}>{DAY[openingHour.day]}</Typography>
                        <Typography sx={{ mb: 1.5 }}>
                            {displayHours(openingHour?.openAt)} - {displayHours(openingHour?.closeAt)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Intégration du catalogue produits spécifique à la boutique */}
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>
                Les produits :
            </Typography>
            {id && <ShopProducts shopId={id} />}
        </Paper>
    );
};

export default ShopDetails;
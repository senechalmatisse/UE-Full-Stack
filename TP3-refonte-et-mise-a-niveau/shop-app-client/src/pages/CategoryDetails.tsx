import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext, useToastContext } from '../context';
import { CategoryService } from '../services';
import { Category } from '../types';
import { ActionButtons } from '../components';

/**
 * Vue détaillée dédiée à la consultation et à la gestion unitaire d'une catégorie.
 * <p>
 * Ce composant assure l'affichage des informations spécifiques à une catégorie identifiée par l'URL.
 * Il agit comme un panneau d'administration contextuel, offrant non seulement la visualisation du nom,
 * mais également l'accès rapide aux fonctions de modification et de suppression via l'intégration
 * du composant {@link ActionButtons}.
 * </p>
 * <p>
 * L'architecture de ce module repose sur une synchronisation stricte avec l'API : les données sont
 * chargées à l'initialisation et toute action critique (comme la suppression) est encadrée par
 * une gestion d'état asynchrone (Loader) et un système de notification utilisateur (Toaster).
 * </p>
 */
const CategoryDetails = () => {
    // Récupération de l'identifiant de la ressource depuis les paramètres de route
    const { id } = useParams();
    const navigate = useNavigate();

    // Hooks de contexte pour le pilotage de l'interface globale (Chargement et Notifications)
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();

    const [category, setCategory] = useState<Category | null>(null);

    /**
     * Récupère les données de la catégorie cible depuis le backend.
     * @param categoryId L'identifiant unique de la catégorie.
     */
    const getCategory = (categoryId: string) => {
        CategoryService.getCategory(categoryId).then((res) => {
            setCategory(res.data);
        });
    };

    /**
     * Synchronisation du composant avec l'URL.
     * Ce hook déclenche le chargement des données dès que l'identifiant dans l'URL est disponible ou modifié.
     */
    useEffect(() => {
        id && getCategory(id);
    }, [id]);

    /**
     * Orchestre le processus de suppression de la catégorie courante.
     * <p>
     * Cette méthode gère le flux complet de l'opération administrative :
     * 1. Activation de l'indicateur de chargement bloquant.
     * 2. Appel au service de suppression API.
     * 3. En cas de succès : redirection vers la liste principale et affichage d'une notification de confirmation.
     * 4. En cas d'échec : affichage d'une alerte d'erreur sans navigation.
     * 5. Désactivation finale du chargement (bloc finally).
     * </p>
     */
    const handleDelete = () => {
        setLoading(true);
        id &&
            CategoryService.deleteCategory(id)
                .then(() => {
                    navigate('/category');
                    setToast({ severity: 'success', message: 'La catégorie a bien été supprimée' });
                })
                .catch(() => {
                    setToast({ severity: 'error', message: 'Une erreur est survenue lors de la suppresion' });
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    /**
     * Redirige l'utilisateur vers le formulaire d'édition pour la ressource actuelle.
     */
    const handleEdit = () => {
        navigate(`/category/edit/${id}`);
    };

    // Interruption du rendu si les données ne sont pas encore chargées
    if (!category) return <></>;

    return (
        <Paper
            elevation={1}
            sx={{
                position: 'relative',
                padding: 4,
            }}
        >
            {/* Délégation de l'affichage des boutons d'action via le pattern "Render Props" implicite */}
            <ActionButtons handleDelete={handleDelete} handleEdit={handleEdit} />

            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                    mt: { xs: 5, sm: 0 }, 
                }}
            >
                {category.name}
            </Typography>
        </Paper>

    );
};

export default CategoryDetails;
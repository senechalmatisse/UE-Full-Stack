import { Box, Button, Divider, FormControl, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext, useToastContext } from '../context';
import { CategoryService } from '../services';
import { MinimalCategory, ObjectPropertyString } from '../types';

/**
 * Définit le schéma de validation applicatif pour l'entité catégorie.
 * <p>
 * Cette fonction pure évalue l'état de l'objet et retourne un dictionnaire d'erreurs.
 * Actuellement, la seule contrainte d'intégrité impose que le champ "nom" ne soit pas vide,
 * garantissant ainsi qu'aucune catégorie anonyme ne puisse être persistée en base de données.
 * </p>
 *
 * @param category L'objet catégorie à valider.
 * @return Un objet mappant chaque champ à son message d'erreur potentiel (ou une chaîne vide).
 */
const schema = (category: MinimalCategory) => ({
    name: category.name ? '' : 'Ce champ est requis',
});

/**
 * Composant de formulaire transactionnel pour la gestion des catégories.
 * <p>
 * Ce module implémente une interface utilisateur unifiée gérant à la fois la création et la modification
 * des ressources ("Upsert logic"). Il détermine son mode opératoire (Ajout ou Édition) en analysant
 * la présence d'un identifiant dans l'URL via le hook {@code useParams}.
 * </p>
 * <p>
 * Sur le plan architectural, ce composant orchestre le cycle de vie complet de la donnée de formulaire :
 * de l'initialisation (vide ou chargée depuis l'API), en passant par la validation locale, jusqu'à
 * la persistance finale. Il intègre également une gestion fine des retours utilisateur, pilotant
 * les indicateurs de chargement et les notifications de succès ou d'échec via les contextes globaux.
 * </p>
 */
const CategoryForm = () => {
    // Extraction des paramètres de route pour identifier le contexte (Création vs Édition)
    const { id } = useParams();
    const isAddMode = !id;

    const navigate = useNavigate();

    // Hooks de contexte pour le pilotage des effets de bord (UI Feedback)
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();

    // États locaux pour la gestion des données de formulaire et des erreurs de validation
    const [errors, setErrors] = useState<ObjectPropertyString<MinimalCategory>>();
    const [category, setCategory] = useState<MinimalCategory>({
        name: '',
    });

    /**
     * Charge les données d'une catégorie existante pour pré-remplir le formulaire.
     * <p>
     * Cette méthode est invoquée exclusivement en mode "Édition". Elle encapsule l'appel API
     * dans une séquence gérant l'état de chargement, assurant que l'interface est bloquée
     * durant la récupération des données pour éviter toute interaction prématurée.
     * </p>
     *
     * @param categoryId L'identifiant technique de la ressource à éditer.
     */
    const getCategory = (categoryId: string) => {
        setLoading(true);
        CategoryService.getCategory(categoryId)
            .then((res) => {
                setCategory({
                    ...res.data,
                    id: id,
                });
            })
            .finally(() => setLoading(false));
    };

    /**
     * Synchronisation du cycle de vie du composant.
     * Ce hook déclenche le chargement initial des données uniquement si le composant
     * est monté en mode édition et qu'un identifiant valide est fourni.
     */
    useEffect(() => {
        !isAddMode && id && getCategory(id);
    }, [isAddMode]);

    /**
     * Exécute la persistance d'une nouvelle catégorie.
     * <p>
     * En cas de succès, l'utilisateur est redirigé vers la liste principale accompagné
     * d'une notification de confirmation. En cas d'échec, une alerte est levée sans navigation.
     * </p>
     */
    const createCategory = () => {
        setLoading(true);
        CategoryService.createCategory(category)
            .then(() => {
                navigate('/category');
                setToast({ severity: 'success', message: 'La catégorie a bien été créée' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la création' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Applique les modifications sur une catégorie existante.
     * <p>
     * Contrairement à la création, la redirection en cas de succès pointe vers la vue détaillée
     * de la catégorie, permettant une vérification immédiate des changements apportés.
     * </p>
     */
    const editCategory = () => {
        setLoading(true);
        CategoryService.editCategory(category)
            .then(() => {
                navigate(`/category/${id}`);
                setToast({ severity: 'success', message: 'La catégorie a bien été modifiée' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la modification' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Moteur de validation interne.
     * <p>
     * Cette méthode met à jour l'état des erreurs et retourne un booléen indiquant la viabilité
     * du formulaire. Elle vérifie que l'ensemble des règles définies dans le schéma retournent
     * des chaînes vides (absence d'erreur).
     * </p>
     *
     * @return true si le formulaire est valide, false sinon.
     */
    const validate = () => {
        setErrors(schema(category));
        return Object.values(schema(category)).every((o) => o == '');
    };

    /**
     * Orchestrateur de soumission du formulaire.
     * <p>
     * Cette fonction agit comme un aiguillage : elle bloque d'abord le processus si la validation échoue.
     * Ensuite, elle délègue le traitement à la méthode de persistance appropriée (création ou édition)
     * en fonction du mode opératoire détecté à l'initialisation.
     * </p>
     */
    const handleSubmit = () => {
        if (!validate()) return;
        if (isAddMode) createCategory();
        else editCategory();
    };

    return (
        <Paper elevation={1} sx={{ padding: 4 }}>
            <Typography variant="h2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                {isAddMode ? 'Ajouter une catégorie' : 'Modifier la catégorie'}
            </Typography>

            <FormControl
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    ml: 'auto',
                    mr: 'auto',
                    width: '100%',
                    maxWidth: 600,
                }}
            >
                <Divider>Informations de la catégorie</Divider>
                <TextField
                    autoFocus
                    required
                    label="Nom"
                    value={category.name}
                    onChange={(e) => setCategory({ ...category, name: e.target.value })}
                    error={!!errors?.name}
                    helperText={errors?.name}
                    sx={{
                        my: 2,
                        width: '100%',
                    }}
                />
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleSubmit}>
                    Valider
                </Button>
            </Box>
        </Paper>
    );
};

export default CategoryForm;
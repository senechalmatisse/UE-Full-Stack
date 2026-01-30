import { Box, Fab, Grid, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../components';
import { useAppContext } from '../context';
import { CategoryService } from '../services';
import { Category } from '../types';

/**
 * Vue principale dédiée à la consultation et à la gestion du référentiel des catégories.
 * <p>
 * Ce composant structure la page d'indexation des catégories sous forme d'une grille paginée.
 * Il joue le rôle de contrôleur de vue en orchestrant la récupération des données via le {@link CategoryService}
 * et en gérant l'état de chargement global. De plus, il intègre des fonctionnalités de navigation
 * permettant à l'utilisateur d'ajouter de nouvelles entités ou de parcourir le catalogue existant page par page.
 * </p>
 * <p>
 * L'architecture de cette vue repose sur une mise en page fluide qui s'adapte dynamiquement
 * aux dimensions de l'écran (Responsive Design), garantissant ainsi une ergonomie optimale
 * sur les terminaux mobiles comme sur les postes de travail.
 * </p>
 */
const Categories = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();

    // Gestion de l'état des données et de la pagination
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    const theme = useTheme();

    /**
     * Indicateur booléen pour la logique d'adaptation responsive.
     * Il détecte si la largeur de l'écran est inférieure au point de rupture "sm" (small),
     * permettant d'ajuster conditionnellement les espacements et l'alignement des éléments.
     */
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    /**
     * Orchestre la récupération asynchrone des données depuis le backend.
     * <p>
     * Cette fonction encapsule la logique d'appel au service métier. Elle active l'indicateur de chargement global
     * avant de solliciter l'API, puis met à jour l'état local avec les résultats obtenus (contenu et métadonnées de pagination).
     * Enfin, le bloc {@code finally} assure la désactivation du loader, quel que soit le résultat de l'opération,
     * garantissant la stabilité de l'interface utilisateur.
     * </p>
     */
    const getCategories = () => {
        setLoading(true);
        CategoryService.getCategories(pageSelected, 9)
            .then((res) => {
                setCategories(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    /**
     * Synchronisation réactive des données.
     * Ce hook déclenche le rafraîchissement de la liste à chaque modification de la page sélectionnée,
     * assurant la cohérence entre la navigation de l'utilisateur et les données affichées.
     */
    useEffect(() => {
        getCategories();
    }, [pageSelected]);

    /**
     * Gestionnaire d'événement pour le changement de page.
     * Il effectue la conversion technique nécessaire entre l'indexation de base 1 utilisée
     * par le composant visuel de pagination et l'indexation de base 0 attendue par l'API Spring Boot.
     */
    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                px: isSmallScreen ? 2 : 5,
            }}
        >
            <Typography variant="h2" sx={{ fontSize: isSmallScreen ? '1.5rem' : '2rem' }}>
                Les catégories
            </Typography>

            {/* Zone d'actions : Bouton Ajouter une catégorie */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    justifyContent: isSmallScreen ? 'center' : 'flex-end',
                    gap: 2,
                }}
            >
                <Fab
                    variant="extended"
                    color="primary"
                    aria-label="add"
                    onClick={() => navigate('/category/create')}
                    sx={{ alignSelf: isSmallScreen ? 'center' : 'auto' }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter une catégorie
                </Fab>
            </Box>

            {/* Grille de présentation des catégories */}
            <Grid container alignItems="center" rowSpacing={3} columnSpacing={2}>
                {categories?.map((category) => (
                    <Grid item key={category.id} xs={12} sm={6} md={4}>
                        <CategoryCard category={category} />
                    </Grid>
                ))}
            </Grid>

            {/* Contrôle de pagination ou message d'absence de données */}
            {categories?.length !== 0 ? (
                <Pagination
                    count={count}
                    page={page}
                    siblingCount={1}
                    onChange={handleChangePagination}
                    sx={{
                        mt: 2,
                        '& .MuiPagination-ul': { justifyContent: 'center' },
                    }}
                />
            ) : (
                <Typography
                    variant="h6"
                    sx={{
                        mt: 2,
                        textAlign: 'center',
                        fontSize: isSmallScreen ? '1rem' : '1.25rem',
                    }}
                >
                    Aucune catégorie correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Categories;
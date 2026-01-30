import {
    Box,
    Fab,
    Grid,
    Pagination,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components';
import { useAppContext } from '../context';
import { ProductService } from '../services';
import { Product } from '../types';

/**
 * Vue principale dédiée à l'inventaire global et à la gestion des produits.
 * <p>
 * Ce composant structure la page de consultation du catalogue complet. Il agit comme un contrôleur de vue
 * qui orchestre la récupération des données via le {@link ProductService} et assure leur présentation
 * sous forme de grille responsive. Contrairement aux vues filtrées (par boutique ou catégorie),
 * ce module liste l'intégralité des références disponibles dans la base de données.
 * </p>
 * <p>
 * Sur le plan ergonomique, l'interface est conçue pour s'adapter fluidement à la taille de l'écran.
 * Elle intègre des contrôles de navigation (pagination) et d'action (ajout de produit) dont la disposition
 * et la taille varient dynamiquement grâce aux hooks de détection de média (Media Queries).
 * </p>
 */
const Products = () => {
    const navigate = useNavigate();

    // Intégration du contexte global pour le pilotage de l'indicateur de chargement (Loader)
    const { setLoading } = useAppContext();

    // Gestion de l'état des données et de la pagination
    const [products, setProducts] = useState<Product[] | null>(null);
    const [count, setCount] = useState<number>(0); // Nombre total de pages disponibles
    const [page, setPage] = useState<number>(0);   // Index visuel pour le composant UI (base 1)
    const [pageSelected, setPageSelected] = useState<number>(0); // Index technique pour l'API (base 0)

    // Configuration du Responsive Design
    const theme = useTheme();

    /**
     * Détection dynamique de la largeur d'affichage.
     * Cette variable booléenne conditionne l'ajustement des marges (padding), la taille des polices
     * et la disposition des éléments (flex-direction) pour optimiser l'expérience sur mobile.
     */
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    /**
     * Exécute la stratégie de récupération des produits.
     * <p>
     * Cette méthode sollicite l'API pour obtenir une tranche paginée de produits (taille fixée à 9 items).
     * Elle gère le cycle de vie de la requête asynchrone en activant le loader avant l'appel
     * et en le désactivant systématiquement à la fin du traitement (succès ou échec).
     * </p>
     */
    const getProducts = () => {
        setLoading(true);
        ProductService.getProducts(pageSelected, 9)
            .then((res) => {
                setProducts(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    /**
     * Synchronisation réactive des données.
     * Ce hook déclenche le rechargement de la grille à chaque interaction de l'utilisateur
     * avec le composant de pagination.
     */
    useEffect(() => {
        getProducts();
    }, [pageSelected]);

    /**
     * Gestionnaire d'événement pour le changement de page.
     * Assure la conversion de l'index UI (base 1) vers l'index API (base 0) avant la mise à jour de l'état.
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
                width: '100%',
                px: isSmallScreen ? 2 : 5,
                pb: 4,
                boxSizing: 'border-box'
            }}
        >
            <Typography variant="h2" sx={{ fontSize: isSmallScreen ? '1.5rem' : '2rem', textAlign: 'center' }}>
                Les produits
            </Typography>

            {/* Zone d'actions : Bouton flottant (Fab) pour la création */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Fab
                    variant="extended"
                    color="primary"
                    aria-label="add"
                    onClick={() => navigate('/product/create')}
                    size={isSmallScreen ? 'medium' : 'large'}
                    sx={{ p: '25px' }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter un produit
                </Fab>
            </Box>

            {/* Grille de produits responsive */}
            <Grid 
                container 
                spacing={3} 
                sx={{
                    width: '100%',
                    margin: 0,
                    justifyContent: 'center'
                }}
            >
                {products?.map((product) => (
                    <Grid 
                        item 
                        key={product.id} 
                        xs={12} 
                        sm={6} 
                        md={4}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            maxWidth: '100%' 
                        }}
                    >
                        {/* Réutilisation du composant carte avec affichage explicite de la boutique associée */}
                        <ProductCard product={product} displayShop={true} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination ou message d'état vide */}
            {products?.length !== 0 ? (
                <Pagination
                    count={count}
                    page={page}
                    siblingCount={1}
                    onChange={handleChangePagination}
                    sx={{
                        mt: 2,
                        '& .MuiPagination-ul': { justifyContent: 'center' },
                    }}
                    size={isSmallScreen ? 'small' : 'medium'}
                />
            ) : (
                <Typography
                    variant="h6"
                    sx={{
                        mt: 2,
                        textAlign: 'center',
                        fontSize: isSmallScreen ? '1rem' : '1.25rem',
                        color: 'text.secondary'
                    }}
                >
                    Aucun produit correspondant
                </Typography>
            )}
        </Box>
    );
};

export default Products;
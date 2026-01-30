import { CategoryService, ProductService } from '../services';
import { useEffect, useState } from 'react';
import { Category, Product, ResponseArray } from '../types';
import { Box, FormControl, Grid, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import ProductCard from './ProductCard';
import { useAppContext } from '../context';
import SelectPaginate from './SelectPaginate';

/**
 * Interface définissant le contexte d'exécution du composant.
 * <p>
 * Ce contrat impose la fourniture de l'identifiant unique de la boutique ({@code shopId}).
 * Cette donnée est pivotale car elle sert de clé étrangère pour toutes les requêtes de récupération
 * des produits et conditionne l'initialisation de la vue.
 * </p>
 */
type Props = {
    shopId: string;
};

/**
 * Composant conteneur gérant l'affichage et le filtrage du catalogue produits d'une boutique.
 * <p>
 * Ce module agit comme un orchestrateur de données. Il a pour responsabilité de récupérer,
 * filtrer et présenter les produits associés à un point de vente spécifique.
 * L'architecture du composant repose sur une interaction dynamique avec les services API :
 * le contenu de la grille est rafraîchi réactivement à chaque modification des critères de filtrage (catégorie)
 * ou de navigation (pagination).
 * </p>
 * <p>
 * Sur le plan ergonomique, ce composant implémente une stratégie de design adaptatif ("Responsive Design")
 * via l'utilisation de {@link useMediaQuery}, garantissant une expérience utilisateur fluide
 * aussi bien sur les terminaux mobiles que sur les écrans de bureau.
 * </p>
 *
 * @param shopId L'identifiant technique de la boutique dont on souhaite afficher le catalogue.
 * @returns La vue structurée comprenant les filtres, la grille de produits et les contrôles de pagination.
 */
const ShopProducts = ({ shopId }: Props) => {
    // Intégration du contexte global pour le pilotage de l'indicateur de chargement (Loader)
    const { setLoading } = useAppContext();

    // Gestion de l'état local des données et de la navigation
    const [products, setProducts] = useState<Product[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);
    const [filter, setFilter] = useState<Category | null>(null);

    // Configuration du Responsive Design
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); 

    /**
     * Exécute la stratégie de récupération des produits.
     * <p>
     * Cette méthode implémente une logique conditionnelle pour déterminer la requête API appropriée.
     * Si un filtre de catégorie est actif (et différent de la valeur par défaut), la méthode sollicite
     * le endpoint de recherche croisée (Boutique + Catégorie). Dans le cas contraire, elle exécute
     * une récupération standard de l'inventaire complet de la boutique.
     * </p>
     * <p>
     * Le cycle de vie de la requête est encadré par la gestion de l'état `loading` du contexte global,
     * assurant un feedback visuel à l'utilisateur durant les échanges réseau.
     * </p>
     */
    const getProducts = () => {
        setLoading(true);
        let promisedProducts: Promise<ResponseArray<Product>>;

        if (filter && filter.name !== 'Toutes les catégories') {
            promisedProducts = ProductService.getProductsbyShopAndCategory(shopId, filter.id, pageSelected, 6);
        } else {
            promisedProducts = ProductService.getProductsbyShop(shopId, pageSelected, 6);
        }

        promisedProducts
            .then((res) => {
                setProducts(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    /**
     * Synchronisation réactive des données.
     * Ce hook déclenche le rechargement du catalogue dès lors que l'identifiant de la boutique,
     * la page courante ou le filtre de catégorie est modifié.
     */
    useEffect(() => {
        getProducts();
    }, [shopId, pageSelected, filter]);

    /**
     * Gestionnaire d'événement pour le changement de page.
     * Il assure la conversion de l'index de page utilisé par le composant UI (base 1)
     * vers l'index attendu par l'API Spring Boot (base 0).
     */
    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                px: isSmallScreen ? 2 : 5,
            }}
        >
            {/* Zone de filtrage */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    justifyContent: isSmallScreen ? 'center' : 'space-between',
                    gap: 2,
                }}
            >
                <FormControl sx={{ minWidth: 220 }}>
                    <SelectPaginate
                        value={filter}
                        onChange={setFilter}
                        placeholder="Catégorie"
                        refetch={CategoryService.getCategories}
                        defaultLabel="Toutes les catégories"
                    />
                </FormControl>
            </Box>

            {/* Grille de produits responsive */}
            <Grid container alignItems="center" rowSpacing={3} columnSpacing={2}>
                {products?.map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination ou message d'absence de résultats */}
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
                />
            ) : (
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                    Aucun produit correspondant
                </Typography>
            )}
        </Box>
    );
};

export default ShopProducts;
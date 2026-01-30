import {
    Box,
    Fab,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filters, ShopCard } from '../components';
import { useAppContext } from '../context';
import { ShopService } from '../services';
import { ResponseArray, Shop } from '../types';
import { useUrlFilters } from '../hooks/useUrlFilters';

/**
 * Fonction utilitaire pure chargée de la sérialisation des critères de filtrage.
 * 
 * <p>
 * Cette méthode transforme l'objet d'état complexe (contenant notamment des objets {@link Dayjs})
 * en une chaîne de paramètres URL (Query String) standardisée, compatible avec l'API backend.
 * Elle assure le formatage des dates en "YYYY-MM-DD" et l'encodage des valeurs pour garantir
 * la validité de la requête HTTP.
 * </p>
 * 
 * <p>
 * En conformité avec le principe de Responsabilité Unique (SRP), cette fonction est pure
 * et ne gère que la transformation de données, sans effet de bord.
 * </p>
 *
 * @param filters L'objet combinant les filtres avancés et le terme de recherche textuelle.
 * @return La chaîne de requête formatée (ex: "&search=test&createdAfter=2023-01-01").
 */
const transformFiltersToURL = (filters: { search: string; inVacations: string; createdAfter: any; createdBefore: any }): string => {
    const transform = {
        ...filters,
        createdAfter: filters.createdAfter?.format('YYYY-MM-DD'),
        createdBefore: filters.createdBefore?.format('YYYY-MM-DD'),
    };

    let url = '';
    for (const [key, value] of Object.entries(transform)) {
        if (value) url += `&${key}=${encodeURIComponent(value)}`;
    }

    return url;
};

/**
 * Vue principale de l'application (Dashboard) centralisant la consultation des boutiques.
 * 
 * <p>
 * Ce composant agit comme un contrôleur complexe qui orchestre plusieurs flux de données utilisateur :
 * la recherche textuelle, le tri, le filtrage multicritère et la pagination.
 * Il implémente une stratégie de récupération de données conditionnelle ("Smart Fetching") qui adapte
 * l'appel API (endpoint standard, trié ou filtré) en fonction de l'état actif.
 * </p>
 * 
 * <p>
 * Pour optimiser les performances réseau et l'expérience utilisateur, un mécanisme de "Debouncing"
 * est appliqué sur la recherche : les appels API ne sont déclenchés qu'après une période de stabilité
 * des saisies, évitant ainsi la surcharge du serveur lors de la frappe.
 * </p>
 * 
 * <p>
 * **Nouveauté - Synchronisation URL** : Le composant utilise désormais le hook personnalisé
 * {@link useUrlFilters} pour maintenir une cohérence bidirectionnelle entre l'état des filtres
 * et les paramètres d'URL. Cette amélioration permet :
 * - Le partage de liens avec filtres pré-appliqués
 * - La navigation avec signets (bookmarking)
 * - La persistance des critères lors de l'utilisation du bouton "Précédent"
 * - Une meilleure compatibilité SEO (si applicable)
 * </p>
 */
const Home = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const [searchParams] = useSearchParams();

    // Utilisation du hook personnalisé pour la gestion des filtres synchronisés avec l'URL
    const { filters, updateFilters } = useUrlFilters();

    // États de gestion des données et de la pagination
    const [shops, setShops] = useState<Shop[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    // États de gestion des critères de recherche et de tri
    const [sort, setSort] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Configuration du Responsive Design
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    /**
     * Hydrate la recherche textuelle depuis l'URL au montage du composant.
     * Ceci permet de restaurer l'état complet de la recherche lors d'un rechargement
     * ou d'une navigation directe via un lien partagé.
     */
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, []);

    /**
     * Orchestre la récupération des données en fonction du contexte actif.
     * 
     * <p>
     * Cette méthode détermine dynamiquement la stratégie d'appel au service {@link ShopService} :
     * 1. Si un tri est actif, l'endpoint de tri est privilégié.
     * 2. Sinon, si des filtres ou une recherche sont présents, l'endpoint de recherche avancée est sollicité.
     * 3. Par défaut, la liste standard paginée est récupérée.
     * </p>
     */
    const getShops = () => {
        setLoading(true);
        let promisedShops: Promise<ResponseArray<Shop>>;
        const allFilters = {
            ...filters,
            search: searchTerm,
        };
        const urlFilters = transformFiltersToURL(allFilters);

        if (sort) promisedShops = ShopService.getShopsSorted(pageSelected, 9, sort);
        else if (urlFilters) promisedShops = ShopService.getShopsFiltered(pageSelected, 9, urlFilters);
        else promisedShops = ShopService.getShops(pageSelected, 9);

        promisedShops
            .then((res) => {
                setShops(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    /**
     * Synchronisation réactive avec mécanisme de temporisation (Debounce).
     * 
     * <p>
     * Ce hook déclenche le rafraîchissement des données lors de la modification de n'importe quel critère
     * (recherche, page, tri, filtres). L'utilisation de {@code setTimeout} introduit un délai de 300ms,
     * permettant de grouper les mises à jour rapides (notamment lors de la frappe dans la barre de recherche)
     * et de réduire le nombre de requêtes HTTP inutiles.
     * </p>
     */
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            getShops();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, pageSelected, sort, filters]);

    /**
     * Synchronise le terme de recherche avec l'URL.
     * Cette mise à jour permet de refléter la recherche dans l'URL sans perturber
     * la gestion des autres paramètres (filtres, pagination).
     */
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');

        if (filters.inVacations) params.set('inVacations', filters.inVacations);
        if (filters.createdAfter) params.set('createdAfter', filters.createdAfter.format('YYYY-MM-DD'));
        if (filters.createdBefore) params.set('createdBefore', filters.createdBefore.format('YYYY-MM-DD'));

        window.history.replaceState(null, '', `?${params.toString()}`);
    }, [searchTerm]);

    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    const handleChangeSort = (event: SelectChangeEvent) => {
        setSort(event.target.value as string);
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
            <Typography variant="h4" textAlign="center">
                Les boutiques
            </Typography>

            {/* Zone d'actions : Ajout de boutique */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: isSmallScreen ? 'center' : 'flex-end',
                }}
            >
                <Fab
                    variant="extended"
                    color="primary"
                    aria-label="add"
                    onClick={() => navigate('/shop/create')}
                    sx={{ px: 2 }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    {isSmallScreen ? 'Ajouter' : 'Ajouter une boutique'}
                </Fab>
            </Box>

            {/* Barre de recherche textuelle */}
            <TextField
                label="Rechercher"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            {/* Zone de contrôles : Tri et Filtres avancés */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    alignItems: 'center',
                    justifyContent: isSmallScreen ? 'center' : 'space-between',
                    gap: 2,
                }}
            >
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="sort-select-label">Trier par</InputLabel>
                    <Select
                        labelId="sort-select-label"
                        id="sort-select"
                        value={sort}
                        label="Trier par"
                        onChange={handleChangeSort}
                    >
                        <MenuItem value="">
                            <em>Aucun</em>
                        </MenuItem>
                        <MenuItem value="name">Nom</MenuItem>
                        <MenuItem value="createdAt">Date de création</MenuItem>
                        <MenuItem value="nbProducts">Nombre de produits</MenuItem>
                    </Select>
                </FormControl>

                <Filters
                    filters={filters}
                    onFilterChange={updateFilters}
                    setSort={setSort}
                    sort={sort}
                />
            </Box>

            {/* Grille de présentation des boutiques avec CSS Grid responsive */}
            <Grid 
                container 
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                    },
                    gap: 3,
                    width: '100%',
                    justifyContent: 'center',
                    margin: 0
                }}
            >
                {shops?.map((shop) => (
                    <Grid 
                        item 
                        key={shop.id} 
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            minWidth: 0
                        }}
                    >
                        <ShopCard shop={shop} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination ou message d'état vide */}
            {shops?.length !== 0 ? (
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
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Aucune boutique correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Home;
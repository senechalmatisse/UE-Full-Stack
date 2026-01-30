/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Divider, FormControl, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SelectPaginate } from '../components';
import { useAppContext, useToastContext } from '../context';
import { CategoryService, ProductService, ShopService } from '../services';
import { MinimalProduct } from '../types';
import Locale from '../types/locale';
import { formatterProductForm, getLocalizedProduct } from '../utils';

/**
 * Définition du schéma de validation appliqué à l'entité produit.
 * <p>
 * Cette fonction évalue la conformité des données saisies selon des règles métier strictes.
 * Elle impose notamment la présence obligatoire du nom en français. Concernant l'anglais,
 * une règle de validation conditionnelle est appliquée : le nom anglais ne devient requis
 * que si une description est renseignée dans cette même langue, garantissant ainsi la cohérence
 * des données traduites. Par ailleurs, une contrainte d'intégrité numérique est appliquée
 * sur le prix pour interdire les valeurs négatives.
 * </p>
 *
 * @param product L'objet produit en cours d'édition.
 * @returns Un objet dictionnaire recensant les erreurs par champ.
 */
const schema = (product: MinimalProduct) => ({
    nameFr: product.localizedProducts[0].name ? '' : 'Ce champ est requis',
    nameEn:
        !product.localizedProducts[1].name && !!product.localizedProducts[1].description
            ? 'Une description est fournie en anglais donc le nom est requis'
            : '',
    price: product.price >= 0 ? '' : 'Le prix ne peut pas être un nombre négatif',
});

/**
 * Composant de formulaire transactionnel dédié à la gestion du cycle de vie des produits.
 * <p>
 * Ce module complexe propose une interface unifiée permettant aussi bien la création que l'édition
 * de fiches produits ("Upsert logic"). Son architecture interne repose sur une gestion d'état élaborée,
 * nécessaire pour manipuler la structure de données imbriquée du produit, qui inclut des propriétés
 * scalaires (prix, boutique) et des collections localisées (noms et descriptions par langue).
 * </p>
 * <p>
 * Sur le plan fonctionnel, ce composant assure l'initialisation des champs multilingues (en forçant
 * la présence des entrées FR et EN même si absentes du backend) et orchestre les interactions avec
 * les services API. Il intègre également des composants de sélection avancée (`SelectPaginate`)
 * pour gérer les relations avec les boutiques et les catégories, tout en assurant un retour visuel
 * à l'utilisateur via la gestion des états de chargement et des notifications.
 * </p>
 */
const ProductForm = () => {
    // Identification du mode opératoire (Création vs Édition) via l'URL
    const { id } = useParams();
    const isAddMode = !id;

    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();

    // État local des erreurs de validation et de l'objet produit
    const [errors, setErrors] = useState<any>({});
    const [product, setProduct] = useState<MinimalProduct>({
        price: 0,
        shop: null,
        categories: [],
        localizedProducts: [
            {
                locale: Locale.FR,
                name: '',
                description: '',
            },
            {
                locale: Locale.EN,
                name: '',
                description: '',
            },
        ],
    });

    /**
     * Charge et normalise les données du produit en mode édition.
     * <p>
     * Cette méthode récupère l'entité depuis le backend et applique une transformation
     * structurelle si nécessaire. En effet, elle garantit que le tableau `localizedProducts`
     * contient toujours au moins deux entrées (FR et EN), complétant dynamiquement les données
     * manquantes pour permettre l'affichage correct des champs de formulaire.
     * </p>
     */
    const getProduct = (productId: string) => {
        setLoading(true);
        ProductService.getProduct(productId)
            .then((res) => {
                const productData = {
                    ...res.data,
                    price: res.data.price / 100,
                    id: id
                };

                if (res.data.localizedProducts.length < 2) {
                    const localizedProducts = [
                        ...res.data.localizedProducts,
                        { locale: Locale.EN, name: '', description: '' },
                    ];
                    setProduct({ ...productData, localizedProducts });
                } else {
                    setProduct(productData);
                }
            })
            .finally(() => setLoading(false));
    };

    // Synchronisation du cycle de vie : chargement des données si mode édition actif
    useEffect(() => {
        !isAddMode && id && getProduct(id);
    }, [isAddMode]);

    /**
     * Exécute la persistance d'un nouveau produit via l'API.
     * Gère les états de chargement et les notifications de succès ou d'échec.
     */
    const createProduct = (productToCreate: MinimalProduct) => {
        setLoading(true);
        ProductService.createProduct(productToCreate)
            .then(() => {
                navigate('/product');
                setToast({ severity: 'success', message: 'Le produit a bien été créé' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la création' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Applique les modifications sur un produit existant via l'API.
     * Redirige l'utilisateur vers la vue détaillée en cas de succès.
     */
    const editProduct = (productToEdit: MinimalProduct) => {
        setLoading(true);
        ProductService.editProduct(productToEdit)
            .then(() => {
                navigate(`/product/${id}`);
                setToast({ severity: 'success', message: 'Le produit a bien été modifié' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la modification' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Moteur de validation du formulaire.
     * Vérifie l'ensemble des règles définies dans le schéma et met à jour l'état des erreurs.
     */
    const validate = () => {
        setErrors(schema(product));
        return Object.values(schema(product)).every((o) => o == '');
    };

    /**
     * Orchestrateur de la soumission du formulaire.
     * <p>
     * Cette fonction valide d'abord les données saisies. Si la validation réussit, elle procède
     * au formatage final de l'objet produit (conversion des prix, nettoyage) via l'utilitaire
     * {@link formatterProductForm} avant de déléguer la sauvegarde à la méthode appropriée
     * (création ou édition).
     * </p>
     */
    const handleSubmit = () => {
        if (!validate()) return;
        const formatizedProduct = formatterProductForm(product);
        if (isAddMode) createProduct(formatizedProduct);
        else editProduct(formatizedProduct);
    };

    /**
     * Gestionnaire générique pour la mise à jour des champs localisés.
     * <p>
     * Cette méthode permet de modifier une propriété spécifique (nom ou description)
     * pour une locale donnée au sein du tableau `localizedProducts`. Elle parcourt le tableau,
     * identifie l'objet correspondant à la locale cible et met à jour sa valeur sans muter
     * les autres entrées, préservant ainsi l'immutabilité de l'état.
     * </p>
     */
    const handleChange = (locale: Locale, key: string, value: string) => {
        const localizedProduct = getLocalizedProduct(product.localizedProducts, locale);
        const newLocalizedProduct = {
            ...localizedProduct,
            [key]: value,
        };
        const newLocalizedProducts = product.localizedProducts.map((o) =>
            Object.values(o).includes(locale) ? newLocalizedProduct : o,
        );
        setProduct({ ...product, localizedProducts: newLocalizedProducts });
    };

    /**
     * Gestionnaire dédié à la saisie du prix.
     * Assure la conversion de la chaîne de caractères en nombre flottant et gère les cas d'erreur (NaN).
     */
    const setPrice = (price: string) => {
        const convertedPrice = parseFloat(price);
        if (Number.isNaN(convertedPrice)) {
            setProduct({ ...product, price: 0 });
            return;
        }
        setProduct({ ...product, price: Number(convertedPrice.toFixed(2)) });
    };

    const setShop = (shop: any) => {
        const newShop = shop.name === 'Aucune' ? null : shop;
        setProduct({ ...product, shop: newShop });
    };

    const setCategories = (categories: any) => {
        const newCategories = categories;
        setProduct({ ...product, categories: newCategories });
    };

    return (
        <Paper elevation={1} sx={{ padding: 4 }}>
            <Typography variant="h2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                {isAddMode ? 'Ajouter un produit' : 'Modifier le produit'}
            </Typography>

            <FormControl sx={{ display: 'block', ml: 'auto', mr: 'auto', width: '100%', maxWidth: 900 }}>

                {/* Section : Noms localisés */}
                <Divider>Nom du produit</Divider>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mt: 2, mb: 6 }}>
                    <TextField
                        autoFocus
                        required
                        label="Nom en français"
                        value={getLocalizedProduct(product.localizedProducts, Locale.FR).name}
                        onChange={(e) => handleChange(Locale.FR, 'name', e.target.value)}
                        fullWidth
                        error={!!errors.nameFr}
                        helperText={errors.nameFr}
                        sx={{ width: { xs: '100%', sm: '48%' } }}
                    />
                    <TextField
                        autoFocus
                        label="Nom en anglais"
                        value={getLocalizedProduct(product.localizedProducts, Locale.EN).name}
                        onChange={(e) => handleChange(Locale.EN, 'name', e.target.value)}
                        fullWidth
                        error={!!errors.nameEn}
                        helperText={errors.nameEn}
                        sx={{ width: { xs: '100%', sm: '48%' } }}
                    />
                </Box>

                {/* Section : Descriptions localisées */}
                <Divider>Description</Divider>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mt: 2, mb: 6 }}>
                    <TextField
                        autoFocus
                        multiline
                        rows={2}
                        label="Description en français"
                        value={getLocalizedProduct(product.localizedProducts, Locale.FR).description}
                        onChange={(e) => handleChange(Locale.FR, 'description', e.target.value)}
                        fullWidth
                        sx={{ width: { xs: '100%', sm: '48%' } }}
                    />
                    <TextField
                        autoFocus
                        multiline
                        rows={2}
                        label="Description en anglais"
                        value={getLocalizedProduct(product.localizedProducts, Locale.EN).description}
                        onChange={(e) => handleChange(Locale.EN, 'description', e.target.value)}
                        fullWidth
                        sx={{ width: { xs: '100%', sm: '48%' } }}
                    />
                </Box>

                {/* Section : Données techniques et relations */}
                <Divider>Informations supplémentaires</Divider>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mt: 2, mb: 3 }}>
                    <TextField
                        autoFocus
                        required
                        type="number"
                        label="Prix"
                        value={product.price.toString()}
                        onChange={(e) => setPrice(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">€</InputAdornment>,
                        }}
                        error={!!errors.price}
                        helperText={errors.price}
                        sx={{ width: { xs: '100%', sm: '48%' } }}
                    />

                    {/* Sélecteur de boutique avec pagination asynchrone */}
                    <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                        <SelectPaginate
                            value={product.shop}
                            onChange={setShop}
                            placeholder="Boutique"
                            refetch={ShopService.getShops}
                            defaultLabel="Aucune"
                        />
                    </Box>
                </Box>

                {/* Sélecteur de catégories multiples */}
                <Box sx={{ mt: 2 }}>
                    <SelectPaginate
                        isMulti
                        value={product.categories}
                        onChange={setCategories}
                        placeholder="Catégories"
                        refetch={CategoryService.getCategories}
                        defaultLabel="Aucune"
                    />
                </Box>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleSubmit}>
                    Valider
                </Button>
            </Box>
        </Paper>
    );
};

export default ProductForm;
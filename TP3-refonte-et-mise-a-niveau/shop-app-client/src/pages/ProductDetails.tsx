import { Paper, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButtons } from '../components';
import { useAppContext, useToastContext } from '../context';
import { ProductService } from '../services';
import { FormattedProduct, Product } from '../types';
import { formatterLocalizedProduct, priceFormatter } from '../utils';

/**
 * Vue détaillée dédiée à la consultation complète d'une fiche produit.
 * <p>
 * Ce composant assure la restitution des informations techniques et commerciales d'un produit spécifique,
 * identifié par son paramètre d'URL. Il agit comme un point de convergence dans l'application, offrant
 * non seulement la visualisation des données, mais également des passerelles de navigation vers les entités liées
 * (Boutique propriétaire, Catégories associées) et les fonctions d'administration (Modification, Suppression).
 * </p>
 * <p>
 * Une particularité de ce module réside dans sa gestion de l'internationalisation : il maintient deux états distincts
 * pour les données (brutes vs formatées) afin de réagir dynamiquement aux changements de langue de l'utilisateur
 * sans nécessiter de nouveau appel réseau pour la traduction des champs descriptifs.
 * </p>
 */
const ProductDetails = () => {
    // Extraction de l'identifiant produit depuis la route active
    const { id } = useParams();
    const navigate = useNavigate();

    // Consommation du contexte pour la gestion de l'i18n et des feedbacks UI
    const { setLoading, locale } = useAppContext();
    const { setToast } = useToastContext();

    // Double gestion d'état : données API brutes et données projetées pour l'affichage
    const [product, setProduct] = useState<Product | null>(null);
    const [formattedProduct, setFormattedProduct] = useState<FormattedProduct | null>();

    /**
     * Récupère les données du produit et normalise les valeurs monétaires.
     * <p>
     * Cette méthode effectue une transformation critique sur le prix : stocké en centimes côté backend
     * pour des raisons de précision arithmétique, il est ici converti en unité standard (division par 100)
     * dès la réception pour faciliter son formatage ultérieur dans l'interface.
     * </p>
     *
     * @param productId L'identifiant unique du produit à charger.
     */
    const getProduct = (productId: string) => {
        ProductService.getProduct(productId).then((res) => {
            res.data.price = res.data.price / 100;
            setProduct(res.data);
        });
    };

    /**
     * Cycle de vie : Chargement initial.
     * Déclenche la récupération des données dès que l'identifiant est disponible dans l'URL.
     */
    useEffect(() => {
        id && getProduct(id);
    }, [id]);

    /**
     * Cycle de vie : Synchronisation i18n.
     * <p>
     * Ce hook réagit aux changements de la locale globale ou du produit chargé.
     * Il invoque l'utilitaire {@code formatterLocalizedProduct} pour sélectionner la traduction appropriée
     * (nom, description) au sein de l'objet produit, garantissant que l'affichage est toujours synchronisé
     * avec la langue choisie par l'utilisateur.
     * </p>
     */
    useEffect(() => {
        product && setFormattedProduct(formatterLocalizedProduct(product, locale));
    }, [locale, product]);

    /**
     * Pilote le processus de suppression du produit.
     * <p>
     * Cette action critique est encadrée par une gestion d'état visuelle (Loader) pour prévenir les doubles clics.
     * En cas de succès, l'utilisateur est redirigé vers l'index des produits avec une notification de confirmation via le ToastContext.
     * </p>
     */
    const handleDelete = () => {
        setLoading(true);
        id &&
            ProductService.deleteProduct(id)
                .then(() => {
                    navigate('/product');
                    setToast({ severity: 'success', message: 'Le produit a bien été supprimé' });
                })
                .catch(() => {
                    setToast({ severity: 'error', message: 'Une erreur est survenue lors de la suppresion' });
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    /**
     * Redirige vers le formulaire d'édition.
     */
    const handleEdit = () => {
        navigate(`/product/edit/${id}`);
    };

    // Interruption du rendu tant que les données formatées ne sont pas prêtes
    if (!formattedProduct) return <></>;

    return (
        <Paper
            elevation={1}
            sx={{
                position: 'relative',
                padding: 4,
            }}
        >
            {/* Injection des contrôles d'administration */}
            <ActionButtons handleDelete={handleDelete} handleEdit={handleEdit} />

            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                    mt: { xs: 5, sm: 0 },
                    marginBottom:3 
                }}
            >
                {formattedProduct.name}
            </Typography>

            <Typography variant="h6">Prix : {priceFormatter(formattedProduct.price)}</Typography>

            {formattedProduct.description && (
                <Typography sx={{ mt: 1.5 }} color="text.secondary">
                    Description : {formattedProduct.description}
                </Typography>
            )}

            {/* Gestion de la relation vers la Boutique parente */}
            <Typography sx={{ mt: 1.5 }}>
                Boutique :{' '}
                {formattedProduct.shop?.name ? (
                    <Link to={`/shop/${formattedProduct.shop?.id}`} style={{ color: '#607d8b' }}>
                        {formattedProduct.shop?.name}
                    </Link>
                ) : (
                    "N'appartient à aucune boutique"
                )}
            </Typography>

            {/* Liste des catégories avec gestion des séparateurs */}
            <Typography sx={{ mt: 1.5, fontStyle: 'italic' }}>
                Catégories : {''}
                {formattedProduct.categories.length === 0
                    ? 'Aucune'
                    : formattedProduct.categories.map((cat, index) => (
                          <Fragment key={cat.id}>
                              <Link to={`/category/${cat.id}`} style={{ color: '#607d8b' }}>
                                  {cat.name}
                              </Link>
                              {/* Ajout conditionnel de la virgule de séparation */}
                              <span>{index === formattedProduct.categories.length - 1 ? '' : ', '}</span>
                          </Fragment>
                      ))}
            </Typography>
        </Paper>
    );
};

export default ProductDetails;
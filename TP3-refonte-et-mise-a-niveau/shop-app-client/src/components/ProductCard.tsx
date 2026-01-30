import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { FormattedProduct, Product } from '../types';
import { formatterLocalizedProduct, priceFormatter } from '../utils';

/**
 * Définition des propriétés d'entrée du composant de carte produit.
 * <p>
 * Cette interface contractuelle impose la fourniture de l'objet métier {@link Product} contenant les données brutes.
 * Elle introduit également un indicateur contextuel optionnel, {@code displayShop}, qui permet de moduler l'affichage
 * selon l'origine de l'appel (par exemple, masquer le nom de la boutique si l'utilisateur navigue déjà
 * au sein de la page de détail de cette boutique).
 * </p>
 */
type Props = {
    product: Product;
    displayShop?: boolean;
};

/**
 * Composant de présentation affichant les informations synthétiques d'un produit.
 * <p>
 * Ce module assure le rendu visuel d'une fiche produit sous forme de tuile interactive.
 * Au-delà du simple affichage, il intègre une logique de formatage dynamique dépendante du contexte
 * d'internationalisation de l'application. En s'abonnant au contexte global via {@link useAppContext},
 * le composant détecte les changements de langue et déclenche, via un hook d'effet {@link useEffect},
 * la mise à jour des libellés (nom et description) grâce à l'utilitaire {@link formatterLocalizedProduct}.
 * </p>
 * <p>
 * Sur le plan ergonomique, la carte entière est rendue cliquable pour faciliter la navigation vers la vue détaillée.
 * De plus, le composant gère la concaténation des catégories multiples et applique une règle de conversion monétaire
 * (division par 100) avant d'utiliser le formateur de prix, supposant un stockage des montants en centimes côté backend.
 * </p>
 *
 * @param props Les données du produit et les options d'affichage.
 * @returns Un élément JSX représentant la carte produit formatée et localisée.
 */
const ProductCard = ({ product, displayShop = false }: Props) => {
    const navigate = useNavigate();

    // Récupération de la locale courante depuis le contexte global
    const { locale } = useAppContext();

    // État local stockant la version du produit adaptée à la langue active
    const [formattedProduct, setFormattedProduct] = useState<FormattedProduct>(
        formatterLocalizedProduct(product, locale),
    );

    // Synchronisation réactive : recalcule le formatage si la langue de l'application change
    useEffect(() => setFormattedProduct(formatterLocalizedProduct(product, locale)), [locale]);

    return (
        <Card
            sx={{ 
                width: '100%', 
                maxWidth: '100%',
                cursor: 'pointer',
                display: 'flex', 
                flexDirection: 'column'
            }}
            onClick={() => navigate(`/product/${formattedProduct.id}`)}
        >
            <CardContent>
                <Typography variant="h4" color="text.primary" gutterBottom>
                    {formattedProduct.name}
                </Typography>

                {/* Application de la conversion des centimes vers l'unité monétaire principale */}
                <Typography variant="h6">Prix : {priceFormatter((formattedProduct.price)/100)}</Typography>

                {formattedProduct.description && (
                    <Typography sx={{ mt: 1.5, maxHeight: 50, overflow: 'hidden' }} color="text.secondary">
                        {formattedProduct.description}
                    </Typography>
                )}

                {/* Affichage conditionnel de la boutique basé sur la prop displayShop */}
                {displayShop && (
                    <Typography sx={{ mt: 1.5 }}>Boutique : {formattedProduct.shop?.name ?? 'Aucune'}</Typography>
                )}

                <Typography sx={{ mt: 1.5, fontStyle: 'italic' }}>
                    Catégories : {''}
                    {formattedProduct.categories.length === 0
                        ? 'Aucune'
                        : formattedProduct.categories.map((cat, index) => (
                              <span key={cat.id}>
                                  {cat.name}
                                  {/* Gestion de la virgule de séparation sauf pour le dernier élément */}
                                  {index === formattedProduct.categories.length - 1 ? '' : ', '}
                              </span>
                          ))}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
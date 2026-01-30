import {
    Box,
    Button,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShopService } from '../services';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { MinimalShop, ObjectPropertyString } from '../types';
import { useAppContext, useToastContext } from '../context';

/**
 * Définition du schéma de validation appliqué à l'entité boutique.
 * <p>
 * Cette fonction pure établit les contraintes d'intégrité minimales requises pour la persistance des données.
 * Actuellement, elle impose la présence obligatoire du nom de l'établissement, garantissant ainsi qu'aucune
 * boutique anonyme ne puisse être créée ou modifiée dans le système.
 * </p>
 *
 * @param shop L'objet boutique soumis à validation.
 * @returns Un dictionnaire d'erreurs indexé par nom de propriété.
 */
const schema = (shop: MinimalShop) => ({
    name: shop.name ? '' : 'Ce champ est requis',
});

/**
 * Composant de formulaire transactionnel dédié à la gestion du cycle de vie des boutiques.
 * <p>
 * Ce module offre une interface unifiée permettant la création ainsi que la modification des points de vente
 * ("Upsert logic"). Sa complexité réside principalement dans la gestion d'une structure de données composite,
 * incluant des propriétés scalaires (nom, statut de congé) et une liste dynamique d'horaires d'ouverture.
 * Le composant gère l'ajout, la suppression et l'édition de ces créneaux horaires en mémoire avant la soumission globale.
 * </p>
 * <p>
 * Sur le plan de l'expérience utilisateur, l'interface est conçue pour être totalement adaptative (Responsive Design).
 * L'utilisation des hooks de détection de média (`useMediaQuery`) permet d'ajuster dynamiquement la disposition
 * des éléments, la taille des polices et l'agencement des champs horaires (vertical sur mobile, horizontal sur bureau)
 * afin de garantir une ergonomie optimale sur tous les supports.
 * </p>
 */
const ShopForm = () => {
    // Identification du contexte (Création vs Édition) via les paramètres d'URL
    const { id } = useParams();
    const isAddMode = !id;

    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();

    // Hooks pour la gestion du Responsive Design
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [errors, setErrors] = useState<ObjectPropertyString<MinimalShop>>();
    const [shop, setShop] = useState<MinimalShop>({
        name: '',
        inVacations: false,
        openingHours: [],
    });

    /**
     * Charge les données de la boutique en mode édition.
     * Cette méthode récupère l'objet complet incluant les horaires associés.
     */
    const getShop = (shopId: string) => {
        setLoading(true);
        ShopService.getShop(shopId)
            .then((res) => {
                setShop({
                    ...res.data,
                    id: id,
                });
            })
            .finally(() => setLoading(false));
    };

    /**
     * Exécute la création d'une nouvelle boutique.
     * Gère le feedback utilisateur via Loader et Toast, puis redirige vers l'accueil en cas de succès.
     */
    const createShop = () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...shopData } = shop;

        ShopService.createShop(shopData as MinimalShop)
            .then(() => {
                navigate('/');
                setToast({ severity: 'success', message: 'La boutique a bien été créée' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la création' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Applique les modifications sur une boutique existante.
     * Redirige vers la vue détaillée de la boutique en cas de succès pour vérification immédiate.
     */
    const editShop = () => {
        setLoading(true);
        ShopService.editShop(shop)
            .then(() => {
                navigate(`/shop/${id}`);
                setToast({ severity: 'success', message: 'La boutique a bien été modifiée' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la modification' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Synchronisation du cycle de vie : chargement initial si un ID est présent
    useEffect(() => {
        !isAddMode && id && getShop(id);
    }, [isAddMode]);

    /**
     * Gestionnaire de mise à jour pour les éléments de la liste des horaires.
     * <p>
     * Cette méthode permet de modifier une propriété spécifique (jour, ouverture, fermeture) d'un créneau
     * identifié par son index, sans muter directement l'état précédent. Elle assure l'immutabilité
     * nécessaire au bon fonctionnement de React.
     * </p>
     */
    const handleChange = (index: number, key: string, value: number | string | undefined) => {
        const openingHours = shop.openingHours;
        const openingHour = {
            ...openingHours[index],
            [key]: value,
        };
        openingHours[index] = openingHour;
        setShop({ ...shop, openingHours });
    };

    /**
     * Ajoute un nouveau créneau horaire à la liste avec des valeurs par défaut (Lundi 09h-18h).
     */
    const handleClickAddHours = () => {
        setShop({ ...shop, openingHours: [...shop.openingHours, { day: 1, openAt: '09:00:00', closeAt: '18:00:00' }] });
    };

    /**
     * Supprime un créneau horaire spécifique de la liste en fonction de son index.
     */
    const handleClickClearHours = (index: number) => {
        setShop({ ...shop, openingHours: shop.openingHours.filter((o, i) => i !== index) });
    };

    const validate = () => {
        setErrors(schema(shop));
        return Object.values(schema(shop)).every((o) => o == '');
    };

    /**
     * Orchestrateur de la soumission du formulaire.
     * Valide les données locales avant de déléguer la persistance à la méthode appropriée (Create ou Edit).
     */
    const handleSubmit = () => {
        if (!validate()) return;
        if (isAddMode) createShop();
        else editShop();
    };

    return (
        <Paper 
            elevation={1} 
            sx={{ 
                padding: { xs: 2, sm: 3, md: 4 },
                margin: { xs: 1, sm: 2 },
            }}
        >
            <Typography 
                variant={isSmallScreen ? 'h4' : 'h2'} 
                sx={{ 
                    marginBottom: { xs: 2, sm: 3 }, 
                    textAlign: 'center',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
            >
                {isAddMode ? 'Ajouter une boutique' : 'Modifier la boutique'}
            </Typography>

            <Box 
                sx={{ 
                    display: 'block', 
                    ml: 'auto', 
                    mr: 'auto', 
                    width: { xs: '100%', sm: '90%', md: '80%' }, 
                    mb: 3 
                }}
            >
                <Divider sx={{ mb: 2 }}>
                    <Typography 
                        variant={isSmallScreen ? 'body1' : 'h6'}
                        sx={{ 
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            px: 1
                        }}
                    >
                        Informations de la boutique
                    </Typography>
                </Divider>

                <FormControl 
                    sx={{ 
                        mt: 2, 
                        width: '100%',
                        maxWidth: { sm: '100%', md: '600px' }
                    }}
                >
                    <TextField
                        autoFocus
                        required
                        label="Nom"
                        value={shop.name}
                        onChange={(e) => setShop({ ...shop, name: e.target.value })}
                        fullWidth
                        error={!!errors?.name}
                        helperText={errors?.name}
                        sx={{ marginBottom: 3 }}
                        size={isSmallScreen ? 'small' : 'medium'}
                    />

                    <FormControlLabel
                        value="start"
                        control={
                            <Switch
                                checked={shop.inVacations}
                                onChange={(e) => setShop({ ...shop, inVacations: e.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }}
                                size={isSmallScreen ? 'small' : 'medium'}
                            />
                        }
                        label={
                            <Typography variant={isSmallScreen ? 'body2' : 'body1'}>
                                En congé
                            </Typography>
                        }
                        sx={{ marginBottom: 2 }}
                    />
                </FormControl>

                {/* Section : Gestion dynamique des horaires d'ouverture */}
                <Divider sx={{ mt: 3, mb: 2 }}>
                    <Typography 
                        variant={isSmallScreen ? 'body1' : 'h6'}
                        sx={{ 
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            px: 1
                        }}
                    >
                        Horaires d&apos;ouverture de la boutique
                    </Typography>
                </Divider>

                <Box 
                    sx={{ 
                        mt: 1, 
                        mb: 3,
                        display: 'flex',
                        justifyContent: isSmallScreen ? 'center' : 'flex-start'
                    }}
                >
                    <Fab 
                        size={isSmallScreen ? 'small' : 'medium'} 
                        color="primary" 
                        aria-label="add"
                        onClick={handleClickAddHours}
                    >
                        <AddIcon />
                    </Fab>
                </Box>

                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: { xs: 2, sm: 3 }, 
                        marginBottom: 3 
                    }}
                >
                    {shop.openingHours.map((openingHour, index) => (
                        <Paper 
                            elevation={2} 
                            key={index} 
                            sx={{ 
                                position: 'relative',
                                padding: { xs: 1, sm: 2 }
                            }}
                        >
                            <Box
                                sx={{
                                    px: { xs: 1, sm: 2 },
                                    pb: 1,
                                    pt: { xs: 6, sm: 7 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 2, sm: 1 },
                                }}
                            >
                                <FormControl 
                                    fullWidth
                                    size={isSmallScreen ? 'small' : 'medium'}
                                >
                                    <InputLabel id={`day-label-${index}`}>Jour</InputLabel>
                                    <Select
                                        labelId={`day-label-${index}`}
                                        id={`day-select-${index}`}
                                        value={openingHour.day}
                                        label="Jour"
                                        onChange={(e) => handleChange(index, 'day', e.target.value)}
                                    >
                                        <MenuItem value={1}>Lundi</MenuItem>
                                        <MenuItem value={2}>Mardi</MenuItem>
                                        <MenuItem value={3}>Mercredi</MenuItem>
                                        <MenuItem value={4}>Jeudi</MenuItem>
                                        <MenuItem value={5}>Vendredi</MenuItem>
                                        <MenuItem value={6}>Samedi</MenuItem>
                                        <MenuItem value={7}>Dimanche</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 2, sm: 1 },
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            label="Ouvre à"
                                            ampm={false}
                                            value={`2014-08-18T${openingHour.openAt}`}
                                            onChange={(v: Dayjs | null) =>
                                                handleChange(index, 'openAt', v?.format('HH:mm:ss'))
                                            }
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    fullWidth
                                                    size={isSmallScreen ? 'small' : 'medium'}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            label="Ferme à"
                                            ampm={false}
                                            value={`2014-08-18T${openingHour.closeAt}`}
                                            onChange={(v: Dayjs | null) =>
                                                handleChange(index, 'closeAt', v?.format('HH:mm:ss'))
                                            }
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    fullWidth
                                                    size={isSmallScreen ? 'small' : 'medium'}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </Box>

                            <Fab 
                                size="small" 
                                color="primary" 
                                sx={{ 
                                    position: 'absolute', 
                                    top: { xs: 5, sm: 8 }, 
                                    right: { xs: 5, sm: 8 } 
                                }}
                                onClick={() => handleClickClearHours(index)}
                            >
                                <ClearIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
                            </Fab>
                        </Paper>
                    ))}
                </Box>
            </Box>

            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: { xs: 2, sm: 3 }
                }}
            >
                <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    size={isSmallScreen ? 'medium' : 'large'}
                    fullWidth={isSmallScreen}
                    sx={{ 
                        maxWidth: isSmallScreen ? '100%' : '200px',
                        px: { xs: 2, sm: 4 }
                    }}
                >
                    Valider
                </Button>
            </Box>
        </Paper>
    );
};

export default ShopForm;
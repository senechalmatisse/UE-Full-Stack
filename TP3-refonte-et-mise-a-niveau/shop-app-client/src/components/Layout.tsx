import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Button,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import SwitchLanguage from './SwitchLanguage';
import Loader from './Loader';

/**
 * Interface de typage définissant le contrat de contenu pour le gabarit.
 * <p>
 * Cette définition impose l'injection d'un élément JSX unique en tant qu'enfant.
 * Ce mécanisme permet au composant d'encapsuler n'importe quelle vue de l'application
 * (Produits, Boutiques, etc.) tout en lui fournissant le cadre de navigation commun.
 * </p>
 */
type Props = {
    children: JSX.Element;
};

/**
 * Référentiel statique des liens de navigation.
 * <p>
 * Cette structure centralise les étiquettes et les routes associées pour faciliter la maintenance
 * du menu. Elle est exploitée aussi bien pour la génération de la barre d'outils (Desktop)
 * que pour la liste du menu latéral (Mobile).
 * </p>
 */
const navItems = [
    { label: 'Boutiques', path: '/' },
    { label: 'Produits', path: '/product' },
    { label: 'Catégories', path: '/category' },
];

/**
 * Composant structurel principal définissant le gabarit global de l'interface utilisateur.
 * <p>
 * Ce module agit comme le conteneur racine ("Wrapper") pour l'ensemble des pages de l'application.
 * Sa responsabilité est d'assurer la permanence des éléments de navigation (en-tête, menus) et
 * la cohérence visuelle transverse. L'architecture de ce composant repose sur une stratégie de
 * design adaptatif ("Responsive Design") : il détecte dynamiquement la taille de l'écran pour
 * basculer entre une navigation par onglets sur ordinateur et un menu latéral ("Drawer") sur mobile.
 * </p>
 * <p>
 * Outre la navigation, ce composant intègre également des fonctionnalités transverses telles que
 * le sélecteur de langue et l'indicateur de chargement global.
 * </p>
 *
 * @param children Le contenu dynamique de la page courante à afficher au sein du layout.
 * @returns La structure DOM complète incluant la navigation et le contenu injecté.
 */
const Layout = ({ children }: Props) => {
    const navigate = useNavigate();

    /**
     * Détection dynamique de la largeur d'affichage via le hook {@link useMediaQuery}.
     * Cette variable booléenne pilote la stratégie de rendu conditionnel : elle vaut `true`
     * si la largeur de l'écran est inférieure au point de rupture (breakpoint) de 600px,
     * déclenchant ainsi l'affichage des éléments mobiles.
     */
    const isMobile = useMediaQuery('(max-width:600px)'); // Change breakpoint as needed
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    /**
     * Définition de la structure du menu latéral dédié aux terminaux mobiles.
     * <p>
     * Ce fragment JSX génère une liste verticale d'éléments cliquables basée sur la configuration `navItems`.
     * L'interaction est configurée pour fermer le menu automatiquement après la sélection d'une route,
     * améliorant ainsi l'ergonomie sur petit écran.
     * </p>
     */
    const drawerContent = (
        <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>
            {/* Barre de navigation supérieure (Header) */}
            <AppBar component="nav">
                <Toolbar>
                    {/* Bouton "Hamburger" visible uniquement en mode mobile */}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Titre de l'application agissant comme lien vers l'accueil */}
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Gestion de boutiques
                    </Typography>

                    {/* Liens de navigation visibles uniquement en mode Desktop */}
                    {!isMobile && (
                        <Box>
                            {navItems.map((item) => (
                                <Button key={item.label} sx={{ color: '#fff' }} onClick={() => navigate(item.path)}>
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {/* Composant de changement de langue positionné à l'extrémité */}
                    <SwitchLanguage />
                </Toolbar>
            </AppBar>

            {/* Menu latéral glissant pour Mobile (Drawer) */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
            >
                {drawerContent}
            </Drawer>

            {/* Indicateur de chargement global */}
            <Loader />

            {/* Conteneur principal du contenu de la page */}
            <Box sx={{ mt: 8 }}>{children}</Box> 
        </div>
    );
};

export default Layout;
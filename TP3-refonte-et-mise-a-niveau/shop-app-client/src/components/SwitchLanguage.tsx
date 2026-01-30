import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import Locale from '../types/locale';
import { useAppContext } from '../context';

/**
 * Composant d'interface utilisateur dédié à la gestion de l'internationalisation (i18n).
 * <p>
 * Ce module offre un mécanisme interactif permettant à l'utilisateur de basculer dynamiquement
 * la langue d'affichage de l'application. Sur le plan architectural, il agit comme un contrôleur
 * direct du contexte global ({@link useAppContext}). Il ne se contente pas de modifier un état local,
 * mais propage le changement de locale (FR/EN) à l'ensemble de l'arborescence des composants via le provider.
 * </p>
 * <p>
 * Visuellement, le composant est implémenté sous la forme d'un menu déroulant (Dropdown) déclenché
 * par une icône générique. Il intègre une logique de retour visuel (feedback) en appliquant
 * un style distinctif (fond grisé) sur l'élément de menu correspondant à la langue actuellement active.
 * </p>
 */
const SwitchLanguage = () => {
    // Consommation du contexte pour accéder à la locale courante et à son mutateur
    const { setLocale, locale } = useAppContext();

    // Gestion de l'état local pour l'ancrage visuel du menu déroulant
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    /**
     * Orchestre la mise à jour du paramètre linguistique.
     * <p>
     * Cette méthode encapsule la logique de transition : elle déclenche la modification de l'état global
     * via `setLocale` puis provoque la fermeture immédiate du menu pour revenir à l'écran principal.
     * </p>
     *
     * @param locale La nouvelle constante de langue sélectionnée (FR ou EN).
     */
    const handleClick = (locale: Locale) => {
        setLocale(locale);
        handleClose();
    };

    /**
     * Capture l'événement d'ouverture du menu.
     * <p>
     * Elle mémorise l'élément DOM cible (le bouton) qui servira de point d'ancrage
     * pour le positionnement relatif du menu flottant.
     * </p>
     */
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton size="large" onClick={handleMenu} color="inherit">
                <LanguageIcon />
            </IconButton>
            <Menu
                sx={{ mt: '35px' }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {/* Option Français avec surbrillance conditionnelle */}
                <MenuItem
                    onClick={() => handleClick(Locale.FR)}
                    sx={{ backgroundColor: locale == 'FR' ? '#f2f5f6' : 'white' }}
                >
                    Français
                </MenuItem>

                {/* Option Anglais avec surbrillance conditionnelle */}
                <MenuItem
                    onClick={() => handleClick(Locale.EN)}
                    sx={{ backgroundColor: locale == 'EN' ? '#f2f5f6' : 'white' }}
                >
                    Anglais
                </MenuItem>
            </Menu>
        </div>
    );
};

export default SwitchLanguage;
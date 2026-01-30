import { createTheme } from '@mui/material';
import { blueGrey, lightBlue } from '@mui/material/colors';

/**
 * Configuration centralisée de la charte graphique de l'application.
 * <p>
 * Ce module définit l'instance de thème personnalisé utilisée par le framework Material UI.
 * En surchargeant les propriétés de la palette par défaut via la méthode {@link createTheme}, 
 * il garantit une identité visuelle cohérente et uniforme sur l'ensemble des interfaces. 
 * </p>
 * <p>
 * Le choix des nuances chromatiques s'articule autour de deux axes : une teinte primaire 
 * basée sur le {@code blueGrey} pour assurer une sobriété professionnelle aux éléments structurels, 
 * et une teinte secondaire {@code lightBlue} pour les accents et mises en évidence douces.
 * Cet objet est destiné à être injecté à la racine de l'application via le {@code ThemeProvider}, 
 * propageant ainsi ces constantes de style à tous les composants atomiques.
 * </p>
 */
const myTheme = createTheme({
    palette: {
        primary: {
            light: blueGrey[300],
            main: blueGrey[500],
            dark: blueGrey[700],
        },
        secondary: {
            light: lightBlue[50],
            main: lightBlue[200],
            dark: lightBlue[300],
        },
    },
});

export default myTheme;
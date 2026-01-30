import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './assets/App.css';
import { Layout } from './components';
import { AppProvider, myTheme, ToastProvider } from './context';
import routes from './routes/routes';

/**
 * Composant racine de l'application (Root Component).
 * <p>
 * Ce module agit comme le point d'entrée névralgique de l'architecture front-end. Sa responsabilité première
 * est d'initialiser et d'orchestrer l'environnement d'exécution global nécessaire au bon fonctionnement
 * des composants enfants. Pour ce faire, il structure l'arbre des composants en empilant les différents
 * fournisseurs de contexte (Providers) selon une hiérarchie stricte : gestion de l'état applicatif global (`AppProvider`),
 * définition du thème visuel Material UI (`ThemeProvider`) et système de notifications utilisateur (`ToastProvider`).
 * </p>
 * <p>
 * Par ailleurs, ce composant porte la logique de routage de l'application. Plutôt que de déclarer statiquement
 * chaque vue, il génère dynamiquement la table de routage en itérant sur la configuration centralisée
 * importée (`routes`). Cette approche modulaire permet d'appliquer systématiquement le gabarit de mise en page
 * principal (`Layout`) à l'ensemble des vues, garantissant ainsi une cohérence visuelle et structurelle
 * (en-tête, navigation, pied de page) sur l'intégralité du parcours utilisateur.
 * </p>
 */
const App = () => {
    return (
        <div className="App">
            <AppProvider>
                <ThemeProvider theme={myTheme}>
                    <ToastProvider>
                        <BrowserRouter>
                            <Routes>
                                {routes.map((route) => (
                                    <Route
                                        key={route.name}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <route.element />
                                            </Layout>
                                        }
                                    />
                                ))}
                            </Routes>
                        </BrowserRouter>
                    </ToastProvider>
                </ThemeProvider>
            </AppProvider>
        </div>
    );
};

export default App;
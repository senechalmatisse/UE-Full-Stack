package fr.fullstack.shopapp.config;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * Configuration globale de la couche présentation (Web MVC) de l'application.
 * <p>
 * Cette classe a pour objectif de définir le comportement du serveur vis-à-vis des requêtes HTTP entrantes,
 * en implémentant l'interface {@link WebMvcConfigurer}.
 */
@Configuration
@EnableWebMvc
public class WebSecurityConfig implements WebMvcConfigurer {

    /**
     * Définit la politique de partage des ressources entre origines multiples (CORS).
     *
     * @param registry Le registre de configuration CORS fourni par le contexte Spring.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedMethods("POST", "GET", "PUT", "DELETE");
    }

    /**
     * Instancie le résolveur de vues par défaut pour le cycle de vie des requêtes MVC.
     *
     * @return Une instance configurée du résolveur de vues interne.
     */
    @Bean
    public InternalResourceViewResolver defaultViewResolver() {
        return new InternalResourceViewResolver();
    }
}
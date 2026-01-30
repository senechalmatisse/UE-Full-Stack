package fr.fullstack.shopapp.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.*;

/**
 * Configuration dédiée à la génération automatique de la documentation de l'API REST.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Définit le périmètre de documentation publique pour l'application.
     *
     * @return L'instance configurée regroupant les endpoints de l'API correspondant au pattern défini.
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("shopapp")
            .pathsToMatch("/api/**")
            .build();
    }
}
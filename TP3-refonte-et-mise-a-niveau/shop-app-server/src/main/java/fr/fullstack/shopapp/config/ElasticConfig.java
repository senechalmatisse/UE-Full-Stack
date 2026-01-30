package fr.fullstack.shopapp.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.context.annotation.*;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;

/**
 * Configuration de l'infrastructure de connexion et de mappage pour Elasticsearch.
 * <p>
 * Cette classe a pour responsabilité de définir les composants nécessaires à l'interaction
 * avec le moteur de recherche. Elle centralise la configuration du client HTTP,
 * la personnalisation de la sérialisation JSON via Jackson, ainsi que l'enregistrement
 * de convertisseurs spécifiques pour assurer la cohérence des données entre l'application et l'index.
 */
@Configuration
public class ElasticConfig {

    /**
     * Adresse de l'hôte du serveur Elasticsearch.
     */
    @Value("${elastic.host}")
    private String elastichost;

    /**
     * Configure et expose un bean {@link ObjectMapper} dédié à la sérialisation et désérialisation JSON.
     *
     * @return Une instance configurée de ObjectMapper prête à être utilisée par le client Elastic.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        SimpleModule customModule = new SimpleModule();
        objectMapper.registerModule(customModule);
        return objectMapper;
    }

    /**
     * Définit les règles de conversion personnalisées pour le contexte Spring Data Elasticsearch.
     *
     * @return L'objet contenant les stratégies de conversion personnalisées.
     */
    @Bean
    public ElasticsearchCustomConversions elasticsearchCustomConversions() {
        return new ElasticsearchCustomConversions(
                Arrays.asList(new LongToLocalTimeConverter())
        );
    }

    /**
     * Initialise et construit le client de haut niveau {@link ElasticsearchClient}.
     *
     * @return Une instance opérationnelle du client Elasticsearch.
     */
    @Bean
    public ElasticsearchClient elasticsearchClient() {
        RestClient restClient = RestClient.builder(
                new HttpHost(elastichost, 9200, "http")
        ).build();

        RestClientTransport transport = new RestClientTransport(
                restClient, new JacksonJsonpMapper()
        );

        return new ElasticsearchClient(transport);
    }
}
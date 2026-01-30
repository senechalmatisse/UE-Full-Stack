package fr.fullstack.shopapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Point d'entrée d'exécution et classe de configuration racine de l'application "Shop App".
 */
@EnableElasticsearchRepositories(basePackages = "fr.fullstack.shopapp.repository.elastic")
@EnableJpaRepositories(basePackages = "fr.fullstack.shopapp.repository.jpa")
@SpringBootApplication
public class ShopAppApplication {

    /**
     * Méthode principale (Main) déclenchant le lancement de la machine virtuelle Java.
     *
     * @param args Les arguments de ligne de commande passés lors du démarrage du processus (optionnels).
     */
    public static void main(String[] args) {
        SpringApplication.run(ShopAppApplication.class, args);
    }
}
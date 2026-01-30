package fr.fullstack.shopapp.service;


import fr.fullstack.shopapp.model.*;
import fr.fullstack.shopapp.repository.jpa.*;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.*;
import org.slf4j.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service technique dédié à la synchronisation initiale du moteur de recherche.
 */
@Service
public class IndexExisitngShops {

    private static final Logger log = LoggerFactory.getLogger(IndexExisitngShops.class);

    @PersistenceContext
    EntityManager em;

    /**
     * Service métier permettant l'accès aux données des boutiques et à la logique d'indexation unitaire.
     */
    private final ShopService shopService;

    /**
     * Dépôt de contrôle utilisé pour vérifier l'état d'avancement des processus de synchronisation.
     */
    private final SyncStatusRepository syncStatusRepository;

    /**
     * Constructeur permettant l'injection des dépendances requises.
     *
     * @param shopService          Le service de gestion des boutiques.
     * @param syncStatusRepository Le référentiel de statut de synchronisation.
     */
    public IndexExisitngShops(
        ShopService shopService,
        SyncStatusRepository syncStatusRepository
    ) {
        this.shopService = shopService;
        this.syncStatusRepository = syncStatusRepository;
    }

    /**
     * Exécute la procédure de déversement des données SQL vers Elasticsearch.
     */
    @PostConstruct
    public void syncDatabaseToElasticsearch() {
        if (syncStatusRepository.existsBySyncCompletedTrue()) {
            IndexExisitngShops.log.info("Synchronization has already been completed.");
            return;
        }

        Page<Shop> shops = shopService.getShopList(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Pageable.unpaged()
        );

        shops.forEach(shop -> {
            try {
                shopService.syncExistingShopsToElasticsearch(shop);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        SyncStatus status = new SyncStatus();
        status.setSyncCompleted(true);
        syncStatusRepository.save(status);

        IndexExisitngShops.log.info("Successfully synced " + shops + " shops to Elasticsearch.");
    }
}
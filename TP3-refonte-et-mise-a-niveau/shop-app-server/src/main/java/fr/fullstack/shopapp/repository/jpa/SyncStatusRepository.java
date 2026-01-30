package fr.fullstack.shopapp.repository.jpa;

import fr.fullstack.shopapp.model.SyncStatus;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Interface de persistance dédiée à la gestion de l'état de synchronisation.
 */
public interface SyncStatusRepository extends JpaRepository<SyncStatus, Long> {

    /**
     * Vérifie si un cycle de synchronisation a déjà été validé intégralement.
     *
     * @return {@code true} si une synchronisation complète a été enregistrée, {@code false} sinon.
     */
    boolean existsBySyncCompletedTrue();
}
package fr.fullstack.shopapp.model;

import jakarta.persistence.*;

/**
 * Entité technique dédiée au suivi de l'état d'avancement des processus de synchronisation.
 */
@Entity
public class SyncStatus {

    /**
     * Identifiant technique de l'enregistrement de statut.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Indicateur binaire reflétant la complétude du processus.
     */
    private boolean syncCompleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSyncCompleted() {
        return syncCompleted;
    }

    public void setSyncCompleted(boolean syncCompleted) {
        this.syncCompleted = syncCompleted;
    }
}
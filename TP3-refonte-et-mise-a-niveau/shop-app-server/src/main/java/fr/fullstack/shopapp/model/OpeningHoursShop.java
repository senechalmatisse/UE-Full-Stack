package fr.fullstack.shopapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalTime;

/**
 * Entité de persistance modélisant les plages horaires d'ouverture d'une boutique.
 */
@Entity
@Table(name = "openingHours")
public class OpeningHoursShop {

    /**
     * Horaire de fermeture de la boutique.
     */
    @Column(nullable = false)
    @JsonFormat(pattern = "HH:mm:ss")
    @NotNull(message = "CloseAt may not be null")
    @Field(type = FieldType.Long)
    private LocalTime closeAt;

    /**
     * Représentation numérique du jour de la semaine associé à la plage horaire.
     */
    @Column(nullable = false)
    @NotNull(message = "Day may not be null")
    @Min(value = 1, message = "Day should not be less than 1")
    @Max(value = 7, message = "Day should not be greater than 7")
    private int day;

    /**
     * Identifiant technique unique de la plage horaire.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    /**
     * Horaire d'ouverture de la boutique.
     */
    @Column(nullable = false)
    @Field(type = FieldType.Long)
    @JsonFormat(pattern = "HH:mm:ss")
    @NotNull(message = "OpenAt may not be null")
    private LocalTime openAt;

    public LocalTime getCloseAt() {
        return closeAt;
    }

    public long getDay() {
        return day;
    }

    public long getId() {
        return id;
    }

    public LocalTime getOpenAt() {
        return openAt;
    }

    public void setCloseAt(LocalTime closeAt) {
        this.closeAt = closeAt;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setOpenAt(LocalTime openAt) {
        this.openAt = openAt;
    }
}
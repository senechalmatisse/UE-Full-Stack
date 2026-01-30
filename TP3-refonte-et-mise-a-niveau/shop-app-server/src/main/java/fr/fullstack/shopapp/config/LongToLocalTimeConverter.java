package fr.fullstack.shopapp.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.time.*;

/**
 * Composant de conversion personnalisé implémentant l'interface standard de Spring.
 * <p>
 * Cette classe a pour vocation de traduire les données brutes stockées sous forme numérique (Long)
 * dans la base de données vers le type temporel Java {@link LocalTime}.
 */
@ReadingConverter
public class LongToLocalTimeConverter implements Converter<Long, LocalTime> {

    /**
     * Opère la transformation d'un timestamp (exprimé en millisecondes) vers une heure locale.
     *
     * @param source La valeur temporelle brute en millisecondes (Long).
     * @return L'instance de {@link LocalTime} correspondant à l'instant dans le fuseau horaire du système.
     */
    @Override
    public LocalTime convert(Long source) {
        Instant instant = Instant.ofEpochMilli(source);
        return instant.atZone(ZoneId.systemDefault()).toLocalTime();
    }
}
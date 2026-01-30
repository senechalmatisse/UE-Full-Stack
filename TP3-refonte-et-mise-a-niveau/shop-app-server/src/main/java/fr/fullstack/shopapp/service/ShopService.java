package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.model.*;
import fr.fullstack.shopapp.repository.elastic.ShopElasticRepository;
import fr.fullstack.shopapp.repository.jpa.ShopRepository;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.*;
import jakarta.persistence.criteria.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service métier centralisant la logique de gestion des boutiques.
 */
@Service
public class ShopService {

    /**
     * Interface de gestion de la persistance JPA, utilisée ici pour la construction de requêtes dynamiques (Criteria API)
     * et la gestion fine du cycle de vie des entités (flush/refresh).
     */
    @PersistenceContext
    private EntityManager em;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ShopElasticRepository shopElasticRepository;

    /**
     * Assure la création atomique d'une boutique et sa double indexation.
     *
     * @param shop L'entité boutique à créer.
     * @return La boutique persistée et synchronisée.
     * @throws Exception Si la validation des horaires échoue ou en cas d'erreur technique.
     */
    @Transactional
    public Shop createShop(Shop shop) throws Exception {
        validateOpeningHours(shop.getOpeningHours());
        try {
            Shop newShop = shopRepository.save(shop);
            em.flush();
            em.refresh(newShop);
            shopElasticRepository.save(newShop);
            return newShop;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Pilote la suppression d'une boutique et le maintien de l'intégrité référentielle.
     *
     * @param id L'identifiant de la boutique à supprimer.
     * @throws Exception Si la boutique est introuvable ou si la suppression échoue.
     */
    @Transactional
    public void deleteShopById(long id) throws Exception {
        try {
            Shop shop = getShop(id);
            deleteNestedRelations(shop);
            shopRepository.deleteById(id);
            shopElasticRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Récupère une boutique par son identifiant via le dépôt relationnel.
     *
     * @param id L'identifiant unique de la boutique.
     * @return L'instance de la boutique.
     * @throws Exception Si la ressource n'existe pas.
     */
    public Shop getShopById(long id) throws Exception {
        try {
            return getShop(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Point d'entrée principal pour la récupération et le filtrage des boutiques.
     * <p>
     * Cette méthode agit comme un répartiteur. Elle analyse les paramètres fournis pour déterminer
     * la stratégie de récupération la plus adaptée :
     * 1. Si un tri spécifique est demandé, elle délègue aux méthodes de repository optimisées.
     * 2. Si des filtres sont présents, elle invoque la logique de recherche complexe.
     * 3. Par défaut, elle retourne une liste paginée triée par identifiant.
     *
     * @param name          Filtre textuel sur le nom (Optionnel).
     * @param sortBy        Critère de tri (Optionnel).
     * @param inVacations   Filtre sur le statut de congés (Optionnel).
     * @param createdBefore Filtre de date maximale (Optionnel).
     * @param createdAfter  Filtre de date minimale (Optionnel).
     * @param pageable      Paramètres de pagination.
     * @return Une page de boutiques correspondant aux critères.
     */
    public Page<Shop> getShopList(
        Optional<String> name,
        Optional<String> sortBy,
        Optional<Boolean> inVacations,
        Optional<String> createdBefore,
        Optional<String> createdAfter,
        Pageable pageable
    ) {
        if (sortBy.isPresent()) {
            switch (sortBy.get()) {
                case "name":
                    return shopRepository.findByOrderByNameAsc(pageable);
                case "createdAt":
                    return shopRepository.findByOrderByCreatedAtAsc(pageable);
                default:
                    return shopRepository.findByOrderByNbProductsAsc(pageable);
            }
        }

        Page<Shop> shopList = getShopListWithFilter(name, inVacations, createdBefore, createdAfter, pageable);
        if (shopList != null) return shopList;
        return shopRepository.findByOrderByIdAsc(pageable);
    }

    /**
     * Met à jour les informations d'une boutique existante.
     *
     * @param shop L'objet boutique modifié.
     * @return La boutique mise à jour.
     * @throws Exception En cas d'erreur de validation ou de persistance.
     */
    @Transactional
    public Shop updateShop(Shop shop) throws Exception {
        try {
            getShop(shop.getId());
            return this.createShop(shop);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    /**
     * Dissocie les produits d'une boutique avant suppression.
     *
     * @param shop La boutique en cours de suppression.
     */
    private void deleteNestedRelations(Shop shop) {
        List<Product> products = shop.getProducts();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            product.setShop(null);
            em.merge(product);
            em.flush();
        }
    }

    /**
     * Méthode utilitaire de récupération sécurisée d'une boutique.
     *
     * @param id L'identifiant de la boutique.
     * @return L'entité trouvée.
     * @throws Exception Si l'entité est introuvable.
     */
    private Shop getShop(Long id) throws Exception {
        Optional<Shop> shop = shopRepository.findById(id);
        if (!shop.isPresent()) throw new Exception("Shop with id " + id + " not found");
        return shop.get();
    }

    /**
     * Orchestre la stratégie de recherche en fonction de la complexité des critères.
     * <p>
     * Cette méthode implémente une logique de basculement (failover) intelligent entre les moteurs de recherche :
     * <ul>
     * <li>Si le terme de recherche contient des espaces, la requête est considérée comme complexe et est dirigée
     * vers l'implémentation JPA Criteria ({@code searchWithJpa}) pour une gestion précise des motifs SQL.</li>
     * <li>Sinon, pour des recherches simples et performantes, la requête est transmise à Elasticsearch.</li>
     * <li>En l'absence de recherche textuelle, les filtres standards JPA sont appliqués.</li>
     * </ul>
     * </p>
     */
    private Page<Shop> getShopListWithFilter(
        Optional<String> name,
        Optional<Boolean> inVacations,
        Optional<String> createdAfter,
        Optional<String> createdBefore,
        Pageable pageable
    ) {
        if (name.isPresent()) {
            String searchName = name.get().trim();

            if (searchName.isEmpty()) {
                return getShopListWithoutSearch(inVacations, createdAfter, createdBefore, pageable);
            }

            if (searchName.contains(" ")) {
                return searchWithJpa(searchName, inVacations, createdAfter, createdBefore, pageable);
            }

            LocalDate after = createdAfter.map(LocalDate::parse).orElse(LocalDate.EPOCH);
            LocalDate before = createdBefore.map(LocalDate::parse).orElse(LocalDate.EPOCH.plusYears(90));
            if (inVacations.isEmpty()) inVacations = Optional.of(false);

            return shopElasticRepository.findAllByNameContainingAndCreatedAtAfterAndCreatedAtBeforeAndInVacationsEquals(
                searchName, after, before, inVacations.get(), pageable
            );
        }

        return getShopListWithoutSearch(inVacations, createdAfter, createdBefore, pageable);
    }

    /**
     * Exécute une recherche multicritère dynamique via l'API Criteria de JPA.
     */
    private Page<Shop> searchWithJpa(
        String searchName,
        Optional<Boolean> inVacations,
        Optional<String> createdAfter,
        Optional<String> createdBefore,
        Pageable pageable
    ) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        CriteriaQuery<Shop> query = cb.createQuery(Shop.class);
        Root<Shop> shop = query.from(Shop.class);
        query.where(buildPredicates(cb, shop, searchName, inVacations, createdAfter, createdBefore));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Shop> countRoot = countQuery.from(Shop.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(buildPredicates(cb, countRoot, searchName, inVacations, createdAfter, createdBefore));

        Long total = em.createQuery(countQuery).getSingleResult();
        List<Shop> shops = em.createQuery(query)
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize())
            .getResultList();

        return new PageImpl<>(shops, pageable, total);
    }

    /**
     * Construit dynamiquement la liste des prédicats (conditions WHERE) pour l'API Criteria.
     */
    private Predicate[] buildPredicates(
        CriteriaBuilder cb, 
        Root<Shop> root,
        String searchName,
        Optional<Boolean> inVacations,
        Optional<String> createdAfter,
        Optional<String> createdBefore
    ) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.like(cb.lower(root.get("name")), "%" + searchName.toLowerCase() + "%"));

        if (inVacations.isPresent()) {
            predicates.add(cb.equal(root.get("inVacations"), inVacations.get()));
        }

        if (createdAfter.isPresent()) {
            predicates.add(cb.greaterThan(root.get("createdAt"), LocalDate.parse(createdAfter.get())));
        }

        if (createdBefore.isPresent()) {
            predicates.add(cb.lessThan(root.get("createdAt"), LocalDate.parse(createdBefore.get())));
        }

        return predicates.toArray(new Predicate[0]);
    }

    /**
     * Sélectionne la méthode de repository appropriée pour les filtres sans recherche textuelle.
     */
    private Page<Shop> getShopListWithoutSearch(
        Optional<Boolean> inVacations,
        Optional<String> createdAfter,
        Optional<String> createdBefore,
        Pageable pageable
    ) {
        if (inVacations.isPresent() && createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThanAndCreatedAtLessThan(
                inVacations.get(),
                LocalDate.parse(createdAfter.get()),
                LocalDate.parse(createdBefore.get()),
                pageable
            );
        }

        if (inVacations.isPresent() && createdBefore.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtLessThan(
                inVacations.get(), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (inVacations.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThan(
                inVacations.get(), LocalDate.parse(createdAfter.get()), pageable
            );
        }

        if (inVacations.isPresent()) {
            return shopRepository.findByInVacations(inVacations.get(), pageable);
        }

        if (createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByCreatedAtBetween(
                LocalDate.parse(createdAfter.get()), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdBefore.isPresent()) {
            return shopRepository.findByCreatedAtLessThan(
                LocalDate.parse(createdBefore.get()), pageable
            );
        }

        return createdAfter.map(s -> shopRepository.findByCreatedAtGreaterThan(
            LocalDate.parse(s), pageable
        )).orElse(null);
    }

    /**
     * Vérifie l'intégrité métier des plages horaires d'ouverture.
     *
     * @param openingHours La liste brute des horaires à valider.
     */
    private void validateOpeningHours(List<OpeningHoursShop> openingHours) {
        Map<Long, List<OpeningHoursShop>> openingHoursByDay = openingHours.stream()
                .collect(Collectors.groupingBy(OpeningHoursShop::getDay));

        openingHoursByDay.values().forEach(hours -> {
            try {
                checkForOverlap(hours);
            } catch (BadRequestException e) {
                throw new RuntimeException(e);
            }
        });
    }

    /**
     * Analyse une liste d'horaires journaliers pour détecter les conflits temporels.
     *
     * @throws BadRequestException En cas de chevauchement détecté.
     */
    private void checkForOverlap(List<OpeningHoursShop> dayOpeningHours) throws BadRequestException {
        List<OpeningHoursShop> sortedHours = dayOpeningHours.stream()
                .sorted(Comparator.comparing(OpeningHoursShop::getOpenAt))
                .toList();

        for (int i = 0; i < sortedHours.size() - 1; i++) {
            OpeningHoursShop current = sortedHours.get(i);
            OpeningHoursShop next = sortedHours.get(i + 1);

            if (isOverlapping(current, next)) {
                throw new BadRequestException(
                    String.format(
                        "Les horaires d'ouverture se chevauchent pour le jour %d : %s et %s",
                        current.getDay(),
                        current,
                        next
                    )
                );
            }
        }
    }

    /**
     * Teste l'intersection temporelle entre deux plages horaires.
     *
     * @return true si l'heure de fermeture du premier créneau est postérieure à l'ouverture du second.
     */
    private boolean isOverlapping(OpeningHoursShop hours1, OpeningHoursShop hours2) {
        return !hours1.getCloseAt().isBefore(hours2.getOpenAt());
    }

    /**
     * Opération de synchronisation unitaire pour le processus d'indexation global.
     */
    @Transactional
    public void syncExistingShopsToElasticsearch(Shop shop) throws Exception {
        Shop toIndex = shopRepository.save(shop);
        em.flush();
        em.refresh(toIndex);
        shopElasticRepository.save(toIndex);
    }
}
# UE FullStack – Regroupement des Travaux Pratiques

Ce dépôt regroupe l’ensemble des TPs réalisés dans le cadre de l’UE FullStack du Master M2.

## Sommaire
- [TP2 – Création d’une Interface Web pour Gérer des Événements et des Artistes](#tp2--création-dune-interface-web-pour-gérer-des-événements-et-des-artistes)

---

## TP2 – Création d’une Interface Web pour Gérer des Événements et des Artistes

Développement de la partie frontend d’une application web consommant une API existante.

### Fonctionnalités principales :
- **Liste des événements** : affichage paginé, aperçu des artistes, bouton de détail
- **Détail d’un événement** : modification des infos, ajout/suppression d’artistes, validations
- **Liste des artistes** : affichage paginé, aperçu des événements, recherche par nom
- **Détail d’un artiste** : modification des infos, ajout/suppression d’événements, validations

### Contraintes techniques :
- **Validation des formulaires** côté client (nom ≥ 3 caractères, dates cohérentes)
- **Pagination** fluide et ergonomique pour les listes
- **Gestion des erreurs serveur** (codes 400, 401, 404, 500) avec messages clairs
- **UX/UI** : responsive design, transitions douces, notifications visuelles

### Lancement du projet :
L’environnement complet (API + frontend) est désormais orchestré à l’aide de Docker Compose, ce qui simplifie le déploiement et garantit la cohérence entre les services.

#### Prérequis (configuration testée perso)

* **Docker** ≥ 28.5
* **Docker Compose** ≥ 2.4

#### Démarrage des services

Depuis la racine du projet, exécuter :

```bash
docker compose up --build
```

Cela lancera :

* **L’API Spring Boot** sur [`http://localhost:8080`](http://localhost:8080)
* **Le frontend (Svelte/Vite)** sur [`http://localhost:5173`](http://localhost:5173)

#### Arrêt des services

```bash
docker compose down
```

#### Nettoyage complet (conteneurs, volumes, cache)

```bash
docker compose down -v --rmi all
```

### 📚 Documentation de l’API

Une fois le conteneur `api` démarré, la documentation est accessible via : [Swagger UI](http://localhost:8080/swagger-ui/index.html)

# UE FullStack – Regroupement des Travaux Pratiques

Ce dépôt regroupe l’ensemble des TPs réalisés dans le cadre de l’UE FullStack du Master M2.

## Sommaire
- [TP2 – Création d’une Interface Web pour Gérer des Événements et des Artistes](#tp2--création-dune-interface-web-pour-gérer-des-événements-et-des-artistes)
- [TP3 – Application de Gestion de Boutiques avec Spring Boot, React et Elasticsearch](#tp3--application-de-gestion-de-boutiques-avec-spring-boot-react-et-elasticsearch)

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

---

## TP3 – Application de Gestion de Boutiques avec Spring Boot, React et Elasticsearch

Refonte et montée de version d'une application complète permettant la gestion de boutiques, produits et catégories aux dernières versions LTS.

### Architecture technique :

#### Backend (Spring Boot)
- **API REST** avec Spring Boot 3.x et Spring Data JPA
- **Base de données** : PostgreSQL pour la persistance relationnelle
- **Moteur de recherche** : Elasticsearch pour les recherches textuelles performantes
- **Double persistance** : synchronisation automatique entre PostgreSQL et Elasticsearch
- **Recherche hybride** : 
  - Elasticsearch pour les recherches simples
  - JPA Criteria API pour les recherches complexes

#### Frontend (React + TypeScript)
- **Framework** : React 18 avec TypeScript
- **UI Library** : Material-UI (MUI) pour un design moderne et responsive
- **Gestion d'état** : Context API pour l'état global (loading, locale, notifications)
- **Internationalisation** : Support multilingue (FR/EN) pour les produits
- **Responsive Design** : Interface adaptative mobile/tablette/desktop

### Lancement du projet :

L'environnement complet est orchestré via Docker Compose avec 4 services interdépendants.

#### Prérequis

* **Docker** ≥ 20.10
* **Docker Compose** ≥ 2.0

#### Démarrage des services

Depuis la racine du projet TP3 :

```bash
docker-compose up --build
```

Cela lancera :
* **PostgreSQL** sur le port `5432` (base de données relationnelle)
* **Elasticsearch** sur le port `9200` (moteur de recherche)
* **API Spring Boot** sur [http://localhost:8080](http://localhost:8080)
* **Frontend React** sur [http://localhost:3000](http://localhost:3000)

### Architecture détaillée :

```
┌─────────────────┐
│  React Frontend │  (Port 3000)
│   TypeScript    │
└────────┬────────┘
         │ HTTP REST
         ▼
┌─────────────────┐
│  Spring Boot    │  (Port 8080)
│   API REST      │
└────┬───────┬────┘
     │       │
     │       └──────────┐
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│PostgreSQL│    │Elasticsearch │
│  (5432)  │    │    (9200)    │
└──────────┘    └──────────────┘
```

#### Initialisation automatique

Au premier démarrage, le service `IndexExistingShops` synchronise automatiquement les boutiques existantes de PostgreSQL vers Elasticsearch.

#### Arrêt des services

```bash
docker-compose down
```

#### Nettoyage complet (volumes + images)

```bash
docker-compose down -v --rmi all
```

### 📚 Documentation de l'API

Une fois les services démarrés : [Swagger UI](http://localhost:8080/swagger-ui/index.html)

# Shop Client

## Prérequis
* **Node.js** et **npm** (pour l'exécution locale).
* **Docker Desktop** (pour l'exécution conteneurisée).

---

## 1. Démarrage via NPM (Environnement de développement)

### Installation des dépendances

À la racine du projet, exécutez la commande suivante pour télécharger et installer l'ensemble des librairies requises :

```bash
npm install

```

### Lancement de l'application

Une fois les dépendances installées, initialisez le serveur de développement avec la commande :

```bash
npm start

```

L'application sera alors accessible depuis votre navigateur à l'adresse suivante : **http://localhost:4200**.

---

## 2. Démarrage via Docker (Environnement conteneurisé)

### Construction et lancement

À la racine du répertoire, exécutez la commande ci-dessous. L'option `--build` force la reconstruction de l'image pour garantir que la dernière version du code est utilisée.

```bash
docker compose up --build

```

Une fois le conteneur actif, l'interface utilisateur est consultable à l'adresse : **http://localhost:4200**.

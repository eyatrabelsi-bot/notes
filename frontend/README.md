# 📝 The Writing Room

> Application web de gestion de notes personnelles — React + Laravel + SQLite

---

## ✨ Fonctionnalités

- 🔐 **Authentification** — Inscription, connexion, déconnexion via Laravel Sanctum
- 📒 **Notes CRUD** — Créer, lire, modifier, supprimer des notes
- 🎯 **Priorités** — Filtrage par priorité : Haute / Moyenne / Basse
- 🔍 **Recherche** — Recherche full-text avec highlight des résultats
- 📅 **Agenda** — Calendrier interactif mensuel/annuel avec tâches planifiées
- ✅ **Tâches** — Gestion de liste de tâches avec toggle terminé/à faire
- 📱 **Interface responsive** — Navigation via barre inférieure mobile-friendly

---

## 🛠️ Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icônes | react-icons (Feather) |
| Backend | Laravel 12 |
| Auth | Laravel Sanctum 4.3 |
| Base de données | SQLite |

---

## 📁 Structure du projet

```
PROJET-NOTES/
├── .gitignore
│
├── frontend/                        # Application React
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js     # Instance Axios configurée
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── logo.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── BottomNav.jsx        # Barre de navigation inférieure
│   │   │   ├── NoteForm.jsx         # Formulaire création/édition note
│   │   │   ├── NoteItem.jsx         # Carte d'une note
│   │   │   ├── NoteList.jsx         # Liste des notes
│   │   │   ├── PrivateRoute.jsx     # Protection des routes authentifiées
│   │   │   └── Toast.jsx            # Notifications temporaires
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Contexte global d'authentification
│   │   ├── pages/
│   │   │   ├── Calendar.jsx         # Agenda et calendrier interactif
│   │   │   ├── Login.jsx            # Page de connexion
│   │   │   ├── Notes.jsx            # Tableau de bord des notes
│   │   │   ├── Register.jsx         # Page d'inscription
│   │   │   ├── Search.jsx           # Recherche de notes
│   │   │   ├── Tasks.jsx            # Liste des tâches
│   │   │   └── Todo.jsx             # Formulaire création de tâche
│   │   ├── App.css
│   │   ├── App.jsx                  # Routes React Router
│   │   ├── index.css
│   │   └── main.jsx                 # Point d'entrée React
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                         # API Laravel
    ├── app/
    │   ├── Http/Controllers/
    │   │   ├── AuthController.php   # Inscription / Connexion / Déconnexion
    │   │   ├── Controller.php       # Contrôleur de base
    │   │   ├── NoteController.php   # CRUD des notes
    │   │   ├── TaskController.php   # CRUD des tâches
    │   │   └── TodoController.php   # Gestion des todos agenda
    │   ├── Models/
    │   │   ├── Note.php
    │   │   ├── Task.php
    │   │   ├── Todo.php
    │   │   └── User.php
    │   └── Providers/
    │       └── AppServiceProvider.php
    ├── bootstrap/
    ├── config/
    │   ├── app.php
    │   ├── auth.php
    │   ├── cache.php
    │   ├── database.php
    │   ├── filesystems.php
    │   ├── logging.php
    │   ├── mail.php
    │   ├── queue.php
    │   ├── sanctum.php              # Config Sanctum (domaines autorisés)
    │   ├── services.php
    │   └── session.php
    ├── database/
    │   ├── factories/
    │   ├── migrations/              # Structure des tables BDD
    │   ├── seeders/
    │   └── database.sqlite          # Base de données SQLite
    ├── public/
    ├── resources/
    ├── routes/
    │   ├── api.php                  # Routes REST de l'API
    │   ├── console.php
    │   └── web.php
    ├── storage/
    ├── .editorconfig
    ├── .env                         # Variables d'environnement (ne pas committer)
    ├── .env.example
    ├── .gitattributes
    ├── .gitignore
    ├── artisan
    ├── composer.json
    ├── composer.lock
    ├── package.json
    ├── phpunit.xml
    └── vite.config.js
```

---

## 🚀 Installation et lancement

### Prérequis

- Node.js >= 18
- PHP >= 8.2
- Composer

---

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/notes.git
cd projet-notes
```

---

### 2. Backend — Laravel

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Créer la base de données SQLite
touch database/database.sqlite

# Lancer les migrations
php artisan migrate

# Démarrer le serveur
php artisan serve
```

> L'API sera disponible sur `http://localhost:8000`

---

### 3. Frontend — React

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

> L'application sera disponible sur `http://localhost:5173`

---

### 4. Configuration `.env` Laravel

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
DB_DATABASE=/chemin/absolu/vers/backend/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

---

### 5. Configuration CORS (`config/cors.php`)

```php
'supports_credentials' => true,
'allowed_origins'      => ['http://localhost:5173'],
```

---

## 🔌 API Endpoints

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/register` | Inscription | ❌ |
| POST | `/api/login` | Connexion | ❌ |
| POST | `/api/logout` | Déconnexion | ✅ |
| GET | `/api/user` | Utilisateur connecté | ✅ |
| GET | `/api/notes` | Liste des notes | ✅ |
| POST | `/api/notes` | Créer une note | ✅ |
| PUT | `/api/notes/{id}` | Modifier une note | ✅ |
| DELETE | `/api/notes/{id}` | Supprimer une note | ✅ |
| GET | `/api/tasks` | Liste des tâches | ✅ |
| POST | `/api/tasks` | Créer une tâche | ✅ |
| PATCH | `/api/tasks/{id}` | Toggle terminé | ✅ |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche | ✅ |

> ✅ = nécessite un token Sanctum valide

---

## 👩‍💻 Auteurs

- **Eya Trabelsi**
- **Dorra Hammami**

Projet réalisé dans le cadre du cours **CPI2 — Programmation Web**
Enseignant : M. Hamdi Nasreddine | 2025/2026
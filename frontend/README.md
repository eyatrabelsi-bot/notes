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
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icônes | react-icons (Feather) |
| Backend | Laravel 10 |
| Auth | Laravel Sanctum |
| Base de données | SQLite |

---

## 📁 Structure du projet

```
projet-notes/
├── frontend/                  # Application React
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── assets/
│   │   │   └── logo.png
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── NoteForm.jsx
│   │   │   ├── NoteList.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Todo.jsx
│   │   │   └── Calendar.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/                   # API Laravel
    ├── app/
    │   ├── Http/Controllers/
    │   │   ├── AuthController.php
    │   │   ├── NoteController.php
    │   │   └── TaskController.php
    │   └── Models/
    │       ├── User.php
    │       ├── Note.php
    │       └── Task.php
    ├── database/
    │   └── database.sqlite
    ├── routes/
    │   └── api.php
    └── config/
        ├── cors.php
        └── sanctum.php
```

---

## 🚀 Installation et lancement

### Prérequis

- Node.js >= 18
- PHP >= 8.1
- Composer

---

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/projet-notes.git
cd projet-notes
```

---

### 2. Backend — Laravel

```bash
cd backend

# Installer les dépendances
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
DB_DATABASE=/chemin/absolu/vers/database/database.sqlite

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

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/register` | Inscription |
| POST | `/api/login` | Connexion |
| POST | `/api/logout` | Déconnexion |
| GET | `/api/user` | Utilisateur connecté |
| GET | `/api/notes` | Liste des notes |
| POST | `/api/notes` | Créer une note |
| PUT | `/api/notes/{id}` | Modifier une note |
| DELETE | `/api/notes/{id}` | Supprimer une note |
| GET | `/api/tasks` | Liste des tâches |
| POST | `/api/tasks` | Créer une tâche |
| PATCH | `/api/tasks/{id}` | Toggle terminé |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche |

> Toutes les routes (sauf register/login) sont protégées par `auth:sanctum`

---

## 👩‍💻 Auteurs

- **Eya Trabelsi**
- **Dorra Hammami**

Projet réalisé dans le cadre du cours **CPI2 — Programmation Web**
Enseignant : M. Hamdi Nasreddine | 2025/2026
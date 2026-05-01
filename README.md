# EduSchedule Pro
Système Intégré de Gestion de l'Emploi du Temps et de Suivi Pédagogique

**Projet Informatique — Module Développement Web**
**ISGE-BF | RST | Année 2025-2026 | Date de rendu : 6 mai 2026**

---

## Prérequis
- WAMP Server (PHP 8+, MySQL 8, Apache)
- Node.js 18+ et npm
- Git

---

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/dipamalionellkevinregis/eduschedulepro.git
cd eduschedulepro
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Ouvrir .env et renseigner vos valeurs (DB_USER, DB_PASSWORD, etc.)
```

### 3. Créer la base de données
Ouvrir phpMyAdmin (http://localhost/phpmyadmin) et exécuter dans l'ordre :
```
database/eduschedule_pro.sql   ← Crée les tables
database/data_demo.sql         ← Insère les données de démonstration
```

Ou via ligne de commande :
```bash
mysql -u root -p < database/eduschedule_pro.sql
mysql -u root -p < database/data_demo.sql
```

### 4. Placer le backend dans WAMP
Copier le dossier `backend/` dans `C:/wamp64/www/eduschedule-pro/backend/`

### 5. Installer et lancer le frontend React
```bash
cd frontend
npm install
npm start
# L'application s'ouvre sur http://localhost:3000
```

---

## Comptes de démonstration
| Rôle           | Email                          | Mot de passe |
|----------------|-------------------------------|--------------|
| Administrateur | admin@isge-bf.edu             | password     |
| Enseignant     | c.bere@isge-bf.edu            | password     |
| Délégué        | delegue.rst-l3@isge-bf.edu    | password     |
| Surveillant    | surveillant@isge-bf.edu       | password     |
| Comptable      | comptable@isge-bf.edu         | password     |

---

## Structure du projet
```
eduschedule-pro/
├── frontend/src/
│   ├── components/   # Composants réutilisables (Navbar, QRScanner, SignaturePad…)
│   ├── pages/        # Pages (LoginPage, DashboardAdmin, EmploiTemps, Cahier…)
│   ├── context/      # AuthContext, NotifContext
│   ├── hooks/        # useAuth, useFetch, useQRScan
│   └── utils/        # formatDate, calcDuration, exportPDF
├── backend/
│   ├── api/          # Endpoints REST PHP
│   ├── models/       # Classes métier PHP
│   ├── config/       # Connexion BDD, constantes, CORS
│   ├── middleware/   # Auth JWT, vérification rôles
│   └── utils/        # Génération QR, export PDF, email
├── database/
│   ├── eduschedule_pro.sql   # Script de création des tables
│   └── data_demo.sql         # Données de démonstration
└── docs/             # Documentation, wireframes, diagrammes
```

---

## Membres du groupe
| Nom | Rôle dans le projet |
|-----|---------------------|
| DIPAMA Lionel Kevin Regis | ... |
| DADA Guillaume Lamoussa | ... |
| KABORE Emmanuel | ... |
| NIKIEMA Maria Roxane | ... |

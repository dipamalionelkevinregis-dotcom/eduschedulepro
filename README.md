# EduSchedule Pro
## Système Intégré de Gestion de l'Emploi du Temps et de Suivi Pédagogique
**ISGE — RST — Année Universitaire 2025-2026**

---

## Prérequis
- **XAMPP / WAMP / MAMP** (PHP 8+ et MySQL 8)
- **Node.js 18+** et npm
- Navigateur moderne (Chrome recommandé pour le scan QR)

---

## Installation rapide

### 1. Base de données
```bash
# Importer le script SQL dans phpMyAdmin ou via CLI :
mysql -u root -p < database/eduschedulepro.sql
```

### 2. Backend PHP
```
# Copier le dossier backend/ dans htdocs/ (XAMPP) ou www/ (WAMP) :
# Chemin final : http://localhost/eduschedulepro/backend/api/

# Configurer la connexion BD si besoin :
# → backend/config/database.php
```

### 3. Frontend React
```bash
cd frontend
npm install
npm start
# → Ouvre http://localhost:3000
```

---

## Comptes de démonstration
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@isge.bf | password | Administrateur |
| cedric.bere@isge.bf | password | Enseignant |
| adama.ouedraogo@isge.bf | password | Enseignant |
| delegue.l1@isge.bf | password | Délégué de classe |
| surveillant@isge.bf | password | Surveillant général |
| comptable@isge.bf | password | Responsable comptable |

---

## Structure du projet
```
eduschedulepro/
├── backend/
│   ├── api/            # Endpoints REST PHP
│   ├── config/         # BD, constantes, CORS
│   ├── middleware/      # JWT Auth
│   ├── utils/          # QR Code, helpers
│   └── index.php       # Routeur principal
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # DashboardLayout
│       ├── context/    # AuthContext, NotifContext
│       ├── hooks/      # useFetch
│       ├── pages/      # Toutes les pages React
│       └── utils/      # api.js, helpers
└── database/
    └── eduschedulepro.sql
```

---

## Flux applicatif
1. **Admin** crée l'emploi du temps et le publie → QR générés automatiquement
2. **Enseignant** scanne le QR à l'entrée en salle → pointage enregistré
3. **Délégué** remplit le cahier de texte et signe numériquement
4. **Enseignant** clôture la séance et cosigne
5. **Admin/Surveillant** génère la fiche de vacation mensuelle
6. **Enseignant** signe la fiche
7. **Surveillant** appose son visa de contrôle
8. **Comptable** approuve et autorise le paiement

---

## API REST — Endpoints principaux
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth?action=login | Connexion |
| GET | /api/classes | Liste des classes |
| GET/POST | /api/emploi-temps | Emplois du temps |
| PUT | /api/emploi-temps?id=X&action=publier | Publier + générer QR |
| POST | /api/pointages | Scanner un QR |
| GET/POST | /api/cahiers | Cahiers de texte |
| POST | /api/cahiers?id=X&action=signer | Signer |
| POST | /api/vacations?action=generer | Générer une fiche |
| GET | /api/dashboard | Statistiques par rôle |

---

## Technologies utilisées
- **Frontend** : React 18, React Router 6
- **Backend** : PHP 8+, API REST, JWT
- **Base de données** : MySQL 8
- **Authentification** : JWT (JSON Web Tokens)
- **QR Code** : chillerlan/php-qrcode (PHP), html5-qrcode (JS)
- **Signatures** : Canvas HTML5

---
*EduSchedule Pro — ISGE 2025-2026 | Développé dans le cadre du module Développement Web*

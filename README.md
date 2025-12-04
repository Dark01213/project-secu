# Secure TODO (Projet Fil Rouge)

Minimal Next.js application focused on implementing required security constraints for the course assignment.

Quick start

1. Copy `.env.example` to `.env` and fill values (`MONGODB_URI`, `JWT_SECRET`).
2. Install deps:

```powershell
npm install
```

3. Run locally (dev):

```powershell
# Projet Sécurité — Installation et guide

Ce README couvre l'installation locale, les variables d'environnement requises et les commandes utiles. Il résume aussi la section **10.1 README & Documentation** de la checklist d'audit.

**But du projet**: application de gestion de TODOs avec rôles (MANAGER / USER), authentification JWT, protection CSRF et audit de sécurité.

**Prérequis**
- Node.js (>=16 recommandé)
- npm
- MongoDB accessible (localement ou via URI)
- PowerShell (Windows) ou un shell compatible

**Installation locale**
- Copier l'exemple d'environnement et installer les dépendances :

```powershell
copy .env.example .env
notepad .env
# remplir les variables dans .env (voir section Variables d'environnement)
npm install
```

- Démarrer l'application en mode développement :

```powershell
npm run dev
```

ou pour production locale (build + start) :

```powershell
npm run build
npm start
```

**Variables d'environnement importantes**
- `MONGODB_URI` : URI MongoDB (ex: `mongodb://127.0.0.1:27017/secure-todo`)
- `JWT_SECRET` : secret JWT fort (NE JAMAIS LE COMMITER)
- `NODE_ENV` : `development` ou `production`
- `NEXT_PUBLIC_BASE_URL` / `BASE` : URL de base (ex: `http://localhost:3000`)

Variables ajoutées pour les scripts de test/seed (exemples dans `.env.example`) :
- `MANAGER_EMAIL`, `MANAGER_PASSWORD`
- `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`
- `SEED_PASSWORD`

Remarque : ne placez pas de secrets réels dans le dépôt. Utilisez `.env` local ou les secrets de votre CI/CD.

**Commandes et scripts utiles**
- Créer un manager (doit définir `MANAGER_PASSWORD`) :

```powershell
node scripts/create-manager.js
```

- Réinitialiser le mot de passe du manager :

```powershell
node scripts/reset-manager-password.js
```

- Vérifier le mot de passe manager (test) :

```powershell
node scripts/check-manager-pw.js
```

- Seed (crée un utilisateur de test + un todo) :

```powershell
node scripts/seed-todos.js
```

- Smoke-flow (flux end-to-end manager→création→user) :

```powershell
node scripts/smoke-flow.js
```

- Test de login simple :

```powershell
node scripts/test-login.js
```

**Sécurité et bonnes pratiques (rappels importants)**
- `.env` est listé dans `.gitignore` — ne le commitez jamais.
- Utilisez un gestionnaire de secrets en production (Vercel secrets, GitHub Actions secrets, AWS Secrets Manager, etc.).
- Ne loggez pas de tokens, mots de passe ou cookies sensibles dans les scripts.
- Les tokens JWT sont envoyés via cookie `token` (HttpOnly). Un cookie `csrfToken` non-HttpOnly est aussi fourni pour les requêtes d'API d'état.
- Pour exécuter les scripts en CI, définissez les variables d'environnement dans les settings du pipeline.

**Activer HTTPS en local (option recommandé)**

La manière la plus simple et fiable de servir votre site en `https://` localement est d'utiliser `mkcert` pour générer un certificat local de confiance, puis d'utiliser un petit proxy TLS qui redirige vers le serveur Next en développement.

Étapes (Windows PowerShell) :

1. Installer `mkcert` (via Chocolatey) si vous ne l'avez pas :

```powershell
choco install mkcert -y
mkcert -install
```

2. Générer un certificat pour `localhost` et `127.0.0.1` :

```powershell
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

3. Installer la dépendance de développement `local-ssl-proxy` et `concurrently` (déjà ajoutées au `package.json`), puis lancer le mode HTTPS :

```powershell
npm install
npm run dev:https
```

Le script `dev:https` démarre Next sur `http://localhost:3000` et un proxy HTTPS sur `https://localhost:3443` (utilisant `localhost.pem` et `localhost-key.pem`). Ouvrez `https://localhost:3443` pour accéder à l'application en HTTPS.

Remarques:
- `mkcert -install` ajoute l'autorité locale aux magasins de certificats de confiance de votre OS/ navigateurs (évite les avertissements). Si vous utilisez Firefox, mkcert installe aussi le certif dans le magasin NSS si `nss` est disponible.
- Les certificats générés sont destinés uniquement à un usage local.
- Si vous préférez, vous pouvez utiliser un nom de domaine personnalisé (ex: `local.project.test`) et générer le certificat pour ce nom — pensez à ajouter l'entrée à votre `hosts`.

Si vous voulez, je peux :
- ajouter automatiquement les scripts `npm` (fait) et commit/push la modification (je peux le faire),
- tenter de générer des certificats ici (nécessite `mkcert` installé sur votre machine — je ne peux pas l'installer à distance),
- ou créer une petite instruction PowerShell stockée sous `scripts/` pour automatiser les commandes mkcert + lancement.

**Section 10.1 — README & Documentation (concrètement ce que nous fournissons ici)**
- Objectif : fournir une documentation claire pour reproduire l'environnement de développement et vérifier la conformité.

Ce fichier (README.md) couvre les éléments exigés par la section 10.1 :
- **Description du projet** : courte, fonctionnelle (début du fichier).
- **Installation locale** : étapes `npm install`, configuration `.env`, commandes `dev`/`build`/`start`.
- **Variables d'environnement** : liste et explication des variables clés (voir plus haut).
- **Commandes** : scripts pour création/seed/test.

Preuves / éléments à fournir pour l'audit (10.1) :
- `README.md` (ce fichier) présent à la racine.
- `.env.example` fourni (présent dans le repo).
- Scripts de seed/test documentés (listés ci-dessus).

**Dépannage rapide**
- Si `npm run dev` échoue : vérifier `MONGODB_URI`, `JWT_SECRET` et que MongoDB est joignable.
- Si un script signale l'absence d'une variable d'environnement, ouvrez ` .env` et renseignez-la.

**Audit des dépendances**
- Lancez :

```powershell
npm audit --production --json
```

Corrigez les vulnérabilités critiques en priorisant la mise à jour de `next` et des dépendances transitoires (voir rapport `npm audit`).

**Contribution**
- Fork / branch feature / PR avec description claire.
- Pas de secrets dans les commits.

**Licence**
- (Ajouter la licence choisie ici si nécessaire)

---

Si vous voulez que je :
- commit/push ce `README.md` pour vous (je peux),
- ajoute des sections supplémentaires (architecture, diagrammes, CI),
- ou génère une checklist d'audit remplie automatiquement à partir des fichiers du repo — dites lequel et je le fais.

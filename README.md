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

**Audit artifacts (preuves)**

Les fichiers suivants contiennent les preuves et sorties de test produites pendant l'audit. Ils sont stockés dans le dossier `audits/` à la racine du projet :

- `audits/npm-audit.json`, `audits/npm-audit-after-next.json`, `audits/npm-audit-postfix.json`, `audits/npm-audit.txt` : rapports `npm audit` avant/après remédiation (montre l'absence de vulnérabilités critiques après corrections).
- `audits/npm-build.txt` : sortie du `npm run build` (Next.js build réussi).
- `audits/create-manager.txt` : sortie du script `scripts/create-manager.js` (création / existence du compte manager).
- `audits/seed-todos.txt` : sortie du script `scripts/seed-todos.js` (création de l'utilisateur seed et d'un todo de test).
- `audits/reset-user-password.txt` : sortie du script `scripts/reset-user-password.js` (réinitialisation du mot de passe du compte de test).
- `audits/admin-access-http.txt` et `audits/admin-access.txt` : résultats des vérifications d'accès aux endpoints admin (anonyme / user / manager).
- `audits/smoke-flow-https.txt` : sortie du smoke-flow exécuté sur `https://localhost:3443` (preuve que le flux fonctionne en HTTPS local via proxy TLS).
- `audits/xss-http.txt` et `audits/xss-test.txt` : sorties des tests XSS et tentatives contrôlées (montre que les entrées sont échappées et que la protection CSRF bloque les requêtes non autorisées).
- `audits/list-users.txt` : listing des utilisateurs présents dans la base (preuve des comptes de test).
- `audits/git-branch.txt`, `audits/git-last-commit.txt` : informations Git (branche utilisée `fix/npm-audit`, derniers commits appliqués pendant l'audit).
- `audits/gitignore.txt` : capture montrant que `.env` et fichiers sensibles sont listés dans `.gitignore`.
- `audits/package.json.txt` : capture du `package.json` installé / scripts (utile pour reproduire les commandes `dev:https`, etc.).

- `audits/file-upload.txt` : résultat de la recherche d'éventuels endpoints d'upload (N/A si aucun trouvé).
- `audits/xss-final.txt` : sortie du test XSS final exécuté pendant l'audit.
- `audits/evidence.zip` : archive contenant les preuves produites pendant l'audit (optionnelle).
- `audits/git-push.txt` : sortie du `git push` des commits récents.
- `audits/key-removal.txt` : trace de la suppression de `localhost-key.pem` et de la réécriture d'historique locale.

Comment utiliser ces preuves :
- Ouvrez `audits/` et retrouvez les fichiers listés ci-dessus. Chaque fichier contient la sortie console complète de l'action correspondante.
- Joignez ces fichiers au rapport d'audit ou incluez des extraits (logs ou captures d'écran) dans un rapport PDF si nécessaire.

Si tu veux, je peux aussi :
- regrouper ces preuves dans un sous-dossier `audits/evidence.zip` (archive) prêt à envoyer ;
- ou générer des captures d'écran automatiques pour les éléments nécessitant une preuve visuelle (ex: page HTTPS sans avertissement dans un navigateur supporté).

## Sécurité des clés locales (certificats / fichiers .pem)

Les fichiers de certificats locaux (`localhost.pem`, `localhost-key.pem`) servent uniquement au développement local. Ils doivent être traités comme des secrets : ne pas les committer, restreindre l'accès et les regénérer si compromise.

Bonnes pratiques et commandes (PowerShell) :

- Vérifier si la clé privée est suivie par Git :
```powershell
git ls-files --full-name | Select-String 'localhost-key.pem'
```
- Si la clé est suivie : la retirer de l'index Git **local** (ne supprime pas le fichier local) puis committer la suppression :
```powershell
git rm --cached localhost-key.pem
git commit -m "chore(security): remove local private key from repo"
```
- Ajouter les fichiers de certificats à `.gitignore` si ce n'est pas déjà fait :
```powershell
Add-Content -Path .gitignore -Value "localhost-key.pem";
Add-Content -Path .gitignore -Value "localhost.pem";
git add .gitignore; git commit -m "chore: ignore local cert files"
```
- Restreindre les permissions (ACL) du fichier pour l'utilisateur courant :
```powershell
$u = whoami
icacls .\localhost-key.pem /inheritance:r
icacls .\localhost-key.pem /grant:r "$u:(R,W)"
```
- Si la clé a été committée dans l'historique Git, purger l'historique est nécessaire (outil recommandé : `git filter-repo` ou `BFG`). C'est une opération disruptive — coordonnez avec votre remote avant de forcer un push.

Alternatives recommandées :
- Utiliser `mkcert` pour créer un certificat local de confiance (recommandé pour navigateur sans avertissement) : `mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1`.
- Pour CI ou usages partagés, stocker les certificats/clefs dans un coffre de secrets (Azure Key Vault, AWS Secrets Manager, GitHub Actions secrets), ou utiliser des certificats temporaires.

Si tu veux, j'ai ajouté un script PowerShell d'aide `scripts/secure-local-key.ps1` pour automatiser les vérifications et actions (vérifier la présence dans git, ajouter à .gitignore, retirer de l'index et appliquer ACL restreintes). Exécute-le en ouvrant PowerShell depuis la racine du projet :
```powershell
.\scripts\secure-local-key.ps1
```

## Nettoyage du dépôt et instructions pour les contributeurs

Pendant l'audit, la clé privée locale `localhost-key.pem` a été retirée de l'index Git et purgée de l'historique local. Un push forcé a été effectué pour nettoyer le remote. Les traces sont dans `audits/key-removal.txt` et `audits/git-push.txt`.

Si tu es un contributeur ayant un clone local du dépôt, synchronise-toi ainsi (attention : ces commandes replacent votre branche locale sur l'état distant) :

```powershell
# Mettre à jour les refs
git fetch origin

# Pour chaque branche locale que tu utilises, soit tu la recrées depuis le remote :
git switch main
git reset --hard origin/main

# Supprime les fichiers non suivis (optionnel, sauvegarder d'abord)
git clean -fd
```

Si tu as des branches locales avec des commits que tu veux conserver, sauvegarde-les (par exemple en créant un patch ou en poussant vers un remote privé) avant d'exécuter le `reset --hard`.

Les artefacts d'audit sont dans `audits/` et une archive `audits/evidence.zip` a été générée pour faciliter l'envoi.


# Secure TODO (Projet Fil Rouge)

Ce projet est une application de gestion de tâches (TODO) développée pour le "Projet Fil Rouge". Il sert d'exemple pédagogique pour montrer
comment appliquer des mesures de sécurité essentielles (authentification sécurisée, hachage des mots de passe, protections XSS/CSRF, contrôle
d'accès) et pour fournir des preuves d'audit reproductibles.

Résumé rapide — ce que vous trouverez ici :
- Guide de démarrage (installation, variables d'environnement)
- Procédure pour activer HTTPS localement (mkcert + proxy TLS)
- Instructions pour exécuter MongoDB en local (Docker ou local)
- Scripts utilitaires pour seed, tests et vérifications de sécurité

Sujet du projet
---------------

Créer une application TODO sécurisée qui démontre :
- Authentification JWT avec rôles (`MANAGER`, `USER`)
- Stockage sécurisé des mots de passe (`bcrypt`)
- Protection contre XSS et CSRF
- Bonnes pratiques pour la gestion des secrets et la configuration locale

Stack technique
---------------

- Langage : JavaScript (Node.js)
- Framework : Next.js (React)
- Base de données : MongoDB
- Auth : JWT + cookies HttpOnly; `bcrypt` pour le hashing
- Outils locaux recommandés : `mkcert`, `local-ssl-proxy`, Docker / docker-compose

Prérequis
---------

- Node.js (>=16 recommandé)
- npm (fourni avec Node.js)
- MongoDB (local ou via URI) ou Docker Desktop
- PowerShell (Windows) ou un shell compatible

Installer les langages et outils (Windows / Linux / macOS)

Suivez la section correspondant à votre OS. Ces commandes installent Node.js, Git, MongoDB, Docker (optionnel) et mkcert.

Windows (Chocolatey)

```powershell
# Installer Chocolatey (si absent)
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer outils principaux
choco install -y nodejs-lts git mongodb-community docker-desktop mkcert

# Après installation, redémarrer PowerShell/ordinateur si demandé
```

Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y curl git build-essential
# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB (exemple simple)
sudo apt install -y mongodb

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

macOS (Homebrew)

```bash
# Installer Homebrew (si nécessaire)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer outils
brew install node git mongodb-community docker mkcert
mkcert -install
```

Notes : `npm` est inclus avec Node.js. Exécutez `node -v` et `npm -v` pour vérifier l'installation.

Quick start

1. Copier l'exemple d'environnement et éditer :

```powershell
copy .env.example .env
notepad .env
# remplir les variables requises (MONGODB_URI, JWT_SECRET, etc.)
```

2. Installer les dépendances :

```powershell
npm install
```

3. Démarrer en développement :

```powershell
npm run dev
```

Scripts utiles (présents dans `scripts/`) :

```powershell
# seed (crée un utilisateur de test + un todo)
node scripts/seed-todos.js

# smoke-flow (flux end-to-end manager→création→user)
node scripts/smoke-flow.js

# test de login simple
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


Lancer le site en HTTPS sur `localhost` — procédure pas-à-pas
--------------------------------------------------------

Procédure rapide et reproductible (PowerShell) :

1) Générer les certificats locaux avec `mkcert` :

```powershell
choco install mkcert -y
mkcert -install
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

2) Démarrer Next.js en HTTP (terminal 1) :

```powershell
npm run dev
```

3) Démarrer le proxy TLS (terminal 2) :

```powershell
npx local-ssl-proxy --source 3443 --target 3000 --cert localhost.pem --key localhost-key.pem
```

4) Ouvrez `https://localhost:3443` dans le navigateur. Si `mkcert` a été installé correctement, le certificat local sera approuvé par votre OS/browser et il n'y aura pas d'avertissement.

Dépannage rapide :
- `ECONNREFUSED` : vérifier que `npm run dev` est bien lancé et écoute sur le port 3000.
- Erreur de certificat : relancer `mkcert -install` en mode administrateur et re-générer les certificats.
- Pour tests rapides avec `curl` (si certificat non approuvé) : `curl.exe -k https://localhost:3443/`

Si tu veux, je peux :

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

**HTTPS local — Guide détaillé pour preuves (Checklist 1.3 & 1.2)**

Objectif : pouvoir accéder à l'application en `https://localhost:XXXX` sans avertissement, et produire des preuves (capture écran + certificat visible) pour l'audit.

- Pré-requis : `mkcert` (ou équivalent) et accès à PowerShell (Windows). Ne committez JAMAIS les clés privées (`localhost-key.pem`) dans le dépôt.

Étapes recommandées (Windows / PowerShell)

1) Installer `mkcert` (si nécessaire) :

```powershell
choco install mkcert -y
mkcert -install
```

2) Générer un certificat local (fichiers : `localhost.pem` et `localhost-key.pem`) :

```powershell
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

3) Lancer votre application en HTTP (port 3000 par défaut) :

```powershell
# En développement
npm run dev

# Ou en production (si vous voulez tester la page d'erreur production)
npm run build; npx next start -p 3000
```

4) Exposer HTTPS local via un petit proxy TLS (exemple avec `local-ssl-proxy`) :

```powershell
npx local-ssl-proxy --source 3443 --target 3000 --cert localhost.pem --key localhost-key.pem
```

Si `local-ssl-proxy` pose problème sur votre machine, une alternative (node proxy léger) est fournie dans `scripts/https-proxy.js` :

```powershell
# Démarrer le proxy Node fourni (si vous préférez ne pas utiliser npx local-ssl-proxy)
node scripts/https-proxy.js
```

5) Ouvrir le navigateur sur : `https://localhost:3443`

Preuves à capturer pour l'audit (Checklist) :
- Capture 1 : la page `https://localhost:3443` ouverte dans le navigateur montrant l'URL (barre d'adresse) et absence d'avertissement.
- Capture 2 : fenêtre du certificat (clic sur le cadenas → Détails/Certificate) montrant `Subject` et `Issuer` (le certificat local mkcert) et les dates de validité.
- Preuve serveur (interne) : le fichier de logs où l'erreur est enregistrée (`audits/server.log`) ou un fichier généré par le proxy (`audits/https-proxy.log`).
- `.env.production` : capture montrant `NODE_ENV=production` (REMPLACEZ/REDACTEZ toute valeur sensible avant d'envoyer la capture).

Commandes utiles pour collecter preuves (PowerShell)

```powershell
# Sauvegarder la page HTTPS (pour preuve) avec curl (ignore le certificat si nécessaire)
curl.exe -k -o .\audits\https-page.html https://localhost:3443/

# Extraire les infos du certificat (Node.js utilitaire, génère audits/cert-info.json)
node -e "const tls=require('tls'),fs=require('fs'); const s=tls.connect(3443,{host:'localhost',rejectUnauthorized:false},()=>{fs.writeFileSync('audits/cert-info.json',JSON.stringify(s.getPeerCertificate(true),null,2)); s.end();});"

# Suivre le log du proxy en temps réel
Get-Content .\audits\https-proxy.log -Wait -Tail 50
```

Bonnes pratiques (sécurité & RGPD)

- Ne commitez JAMAIS `localhost-key.pem` ni d'autres clés privées. Ajoutez-les au `.gitignore` si nécessaire.
- Si vous partagez des captures contenant des fichiers `.env` ou logs, remplacez les valeurs sensibles par `REDACTED` (ex: `JWT_SECRET=REDACTED`).
- Supprimez toute route de test temporaire (ex: `pages/api/trigger-prod-error.js`) avant d'envoyer les artefacts finaux ou avant merge vers `main`.

Si vous voulez que j'ajoute une section `audits/summary-mode-production.md` ou que j'automatise ces étapes via `scripts/setup-https.ps1`, dites-le et je l'ajouterai.


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

Bonnes pratiques et recommandations :

- Vérifier que vos clés privées locales (ex: fichiers .pem) ne sont pas suivies par Git. Si une clé a été ajoutée par erreur, retirez-la de l'index et ajoutez son nom au `.gitignore` sans inclure le contenu du fichier dans le dépôt.
- Restreindre l'accès au fichier clé sur la machine locale (utiliser les outils du système pour limiter les permissions au minimum nécessaire).
- Si une clé privée a été poussée dans l'historique Git, coordonnez-vous avec les responsables du dépôt avant de purger l'historique (opérations disruptives comme `git filter-repo` ou `bfg`), et informez les contributeurs des étapes de resynchronisation.

Remarque : les exemples de commandes d'administration sont volontairement omis ici pour éviter de divulguer des chemins ou méthodes pouvant être sensibles. Utilisez vos procédures internes ou demandez si vous souhaitez des commandes adaptées à votre environnement.

Alternatives recommandées :
- Utiliser `mkcert` pour créer un certificat local de confiance (recommandé pour navigateur sans avertissement) : `mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1`.
- Pour CI ou usages partagés, stocker les certificats/clefs dans un coffre de secrets (Azure Key Vault, AWS Secrets Manager, GitHub Actions secrets), ou utiliser des certificats temporaires.

Si tu veux, j'ai ajouté un script PowerShell d'aide `scripts/secure-local-key.ps1` pour automatiser les vérifications et actions (vérifier la présence dans git, ajouter à .gitignore, retirer de l'index et appliquer ACL restreintes). Exécute-le en ouvrant PowerShell depuis la racine du projet :
```powershell
.\scripts\secure-local-key.ps1
```
Vérification de la checklist — commandes et preuves
-------------------------------------------------

Pour vérifier rapidement que le projet respecte la checklist d'audit, exécutez les commandes suivantes depuis la racine du dépôt (PowerShell). Ces commandes génèrent des artefacts dans le dossier `audits/` que l'on peut joindre au rapport d'audit.

Installation des dépendances :
```powershell
npm install
```

Exécuter l'analyse statique (SAST) avec ESLint et sauvegarder le rapport :
```powershell
npm run sast
npx eslint . --ext .js,.jsx --format unix > audits/eslint-report.txt 2>&1
```

Audit des dépendances (npm) :
```powershell
npm audit --json > audits/npm-audit.json
```

Seeder (crée l'utilisateur administrateur) — s'assurer d'avoir un fichier `.env` (copier `.env.example` puis remplir) :
```powershell
# Copier l'exemple et remplir les variables ADMIN_EMAIL / ADMIN_PASSWORD
copy .env.example .env
notepad .env
# Puis
node scripts/seed-admin.js > audits/seed-admin.txt 2>&1
```

Exécuter le smoke-flow (tests end-to-end) — nécessite `MANAGER_EMAIL`, `MANAGER_PASSWORD`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` dans `.env` :
```powershell
npm run smoke > audits/smoke-flow.txt 2>&1
```

Capturer les en-têtes `Set-Cookie` (PowerShell) — exemple de login :
```powershell
$body = @{ email = 'admin@example.test'; password = 'AdminPassw0rd!' } | ConvertTo-Json
$resp = Invoke-WebRequest -Uri 'https://localhost:3443/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$resp.Headers['Set-Cookie'] | Out-File audits/set-cookie-headers.txt
```

Capturer la page HTTPS (si vous utilisez le proxy TLS local) :
```powershell
curl.exe -k -o .\audits\https-page.html https://localhost:3443/
```

Recommandations rapides pour produire des preuves conformes RGPD/CNIL :
- Redigez/masquez toute donnée sensible dans les captures (`REDACTED`) avant de joindre des artefacts.
- Ne partagez pas de fichiers de clés privées (`*.pem`) ni de `.env` contenant des secrets.
- Si un secret a été poussé par erreur, suivez la procédure de purge d'historique en coordination avec l'équipe (backup branch avant réécriture).

Ces commandes permettent de générer les preuves attendues dans la checklist (rapports SAST, npm audit, smoke-flow, headers Set-Cookie, captures HTTPS).

Logs & Monitoring (recommandation)
---------------------------------

- **Fichiers de logs locaux** : les erreurs serveur sont écrites dans `logs/errors.log` via `lib/handleError.js`.
- **Externaliser les logs en production** : utilisez un service centralisé (Logstash/Elasticsearch, Datadog, Papertrail, Azure Monitor) pour conserver et analyser les logs et configurer des rotations/ACL.
- **Surveillez** : alertes sur les échecs d'authentification répétés, erreurs 5xx fréquentes, et utilisation anormale des endpoints d'upload.
- **Rotation** : configurez logrotate ou la rotation côté service (par ex. une SaaS de logs) pour éviter la croissance illimitée des fichiers locaux.

Ces recommandations sont appliquées partiellement dans le projet (écriture locale dans `logs/errors.log`) et documentées ici pour faciliter la mise en production.

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


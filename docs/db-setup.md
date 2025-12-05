# Initialiser la base MongoDB (instructions)

But: Git ne versionne pas les volumes Docker. Pour permettre à chaque développeur d'obtenir rapidement une DB de test sans committer de données sensibles, suivez l'une des méthodes ci‑dessous.

## Option recommandée : `docker-compose` + service `seeder`

Le dépôt contient un `docker-compose.yml` et `scripts/seed-db.js`.

1. Démarrer MongoDB :
```powershell
docker-compose up -d mongo
```

2. Lancer le seeder (installe les dépendances dans un conteneur Node temporaire puis exécute le script) :
```powershell
# exécute npm ci dans le conteneur et lance le script
docker-compose run --rm seeder
```

Le script crée un compte de test `admin@example.test` avec un mot de passe factice (haché avec bcrypt, 12 rounds). Le script évite les doublons si l'utilisateur existe déjà.

## Option alternative : `mongoimport` depuis un dump JSON

Vous pouvez fournir un fichier `dump/example-users.json` (inclus à titre d'exemple). Pour importer :

```powershell
# depuis l'hôte si le conteneur expose 27017 vers l'hôte
mongoimport --uri "mongodb://localhost:27017/project-secu" --collection users --file dump/example-users.json --jsonArray --drop

# ou via un conteneur connecté au réseau du conteneur mongo
docker run --rm -v ${PWD}:/data --network container:secure-mongo mongo:6 \
  mongoimport --uri "mongodb://127.0.0.1:27017/project-secu" --collection users --file /data/dump/example-users.json --jsonArray --drop
```

Remarque : le fichier JSON d'exemple contient un `passwordHash` factice ; préférez le seeder Node pour générer un hash bcrypt valide.

## Sécurité / RGPD
- N'ajoutez jamais de données de production dans le dépôt.
- Les fichiers de dump doivent être anonymisés ou factices.
- Ajoutez `dump/` à votre `.gitignore` (ou au moins ne commitez pas les dumps).

## Exécution locale sans Docker
Si vous avez Node.js et MongoDB sur l'hôte, vous pouvez aussi exécuter :
```powershell
npm install
node scripts/seed-db.js
```

Cela créera l'utilisateur de test dans `mongodb://localhost:27017/project-secu`.

---
Si vous voulez que j'ajoute `dump/` et `mongo-init/` dans `.gitignore` pour vous, dites-le ; je peux aussi créer un `Makefile` de démarrage ou automatiser la commande `docker-compose run --rm seeder` via un script NPM.

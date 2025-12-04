# Utilisation des scripts

Ces scripts sont destinés à être exécutés en local pour des tests et du peuplement (seeding). Ils ne doivent jamais contenir de secrets codés en dur.

Pré-requis:
- Copier `.env.example` en `.env` et remplir les variables nécessaires (ne pas committer `.env`).

Variables importantes (à définir dans `.env`):
- `MANAGER_EMAIL` et `MANAGER_PASSWORD` : compte manager utilisé par les scripts (création/réinitialisation/test).
- `SEED_USER_EMAIL` et `SEED_USER_PASSWORD` : compte utilisateur de test utilisé par `smoke-flow.js`.
- `SEED_PASSWORD` : mot de passe utilisé par `seed-todos.js` lors de la création d'un utilisateur seed.
- `NEXT_PUBLIC_BASE_URL` ou `BASE` : URL de base pour les scripts qui appellent l'API (par défaut `http://localhost:3000`).

Exemple rapide (PowerShell):

```powershell
# Copier l'exemple et éditer
copy .env.example .env
notepad .env

# Puis lancer un script (après avoir démarré le serveur Next.js)
node scripts/smoke-flow.js
```

Bonnes pratiques:
- Ne stockez jamais de mots de passe réels dans le dépôt.
- Utilisez des variables d'environnement ou un gestionnaire de secrets en CI/CD.
- Vérifiez que `.gitignore` contient `.env` (déjà présent dans ce projet).

Si un script signale l'absence d'une variable d'environnement, définissez-la avant de relancer le script.

---

## Commandes utiles mises à jour

Voici comment utiliser les scripts créés/révisés après la mise à jour de sécurité :

- Créer un manager (doit fournir `MANAGER_PASSWORD` dans l'environnement) :

```powershell
# Assurez-vous d'avoir copié .env depuis .env.example et rempli MANAGER_*
node scripts/create-manager.js
```

- Réinitialiser le mot de passe du manager (utilisez `MANAGER_PASSWORD`) :

```powershell
node scripts/reset-manager-password.js
```

- Vérifier le mot de passe manager (utilise `MANAGER_PASSWORD`) :

```powershell
node scripts/check-manager-pw.js
```

- Seed (création d'un utilisateur de test + TODO) :

```powershell
# Doit définir SEED_PASSWORD (et optionnellement SEED_EMAIL)
node scripts/seed-todos.js
```

- Smoke-flow (end-to-end) :

```powershell
# Doit définir MANAGER_EMAIL, MANAGER_PASSWORD, SEED_USER_EMAIL, SEED_USER_PASSWORD
node scripts/smoke-flow.js
```

## Remarques de sécurité

- Les scripts exigent maintenant que les mots de passe soient fournis via des variables d'environnement. Ils quittent proprement si les variables manquent.
- Ne commitez jamais le fichier `.env` — utilisez `.env.example` comme modèle et placez vos valeurs réelles dans un `.env` local ou dans votre gestionnaire de secrets CI.
- Les scripts n'impriment plus de mots de passe ou de tokens en clair ; ils affichent seulement si un cookie est présent ou manquant.

Si vous voulez que j'automatise le commit Git des modifications et pousse (`git commit` + `git push`), confirmez et je le fais pour vous.

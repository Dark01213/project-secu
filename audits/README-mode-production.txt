Preuves générées pour la checklist 1.2 Mode Production

Fichiers créés temporairement pour test:
- pages/api/trigger-prod-error.js  (route temporaire qui lève une erreur 500)
- .env.production (exemple, valeurs sensibles REDACTED)

Procédure utilisée:
1. npm run build
2. npx next start -p 3000 > audits/server.log 2>&1
3. Récupération de la page d'erreur : curl http://localhost:3000/api/trigger-prod-error -> audits/error-page.html

REMARQUE: Supprimer `pages/api/trigger-prod-error.js` après validation pour ne pas laisser de route de test en prod.

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
npm run dev
```

Security notes
- Passwords hashed with `bcryptjs`.
- JWT in `HttpOnly` cookie with `SameSite=Strict`.
- CSRF mitigated by SameSite cookie and server-side checks.
- Input validated server-side with `validator` and escaped before rendering.
- Headers `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` set via Next config.

See `./pages` and `./pages/api` for implementation details.

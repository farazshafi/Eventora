# Event Booking Platform

An npm-workspaces monorepo containing the React/Vite frontend and modular Express/Mongoose backend foundation.

## Requirements

- Node.js 20.19+ or 22.12+ and npm 10+
- MongoDB for database-backed features (the health endpoint does not require a connection)

## Setup

```powershell
npm install
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Update `server/.env` with a working MongoDB connection URI. The server connects before listening; health reports database readiness, and authentication uses MongoDB for users and token revocation.

Set `JWT_SECRET` to a cryptographically random value of at least 32 characters before deploying. User and authentication endpoints are under `/api/users`; registration and login return a 15-minute bearer token. Send it as `Authorization: Bearer <token>` to `/api/users/me` and `/api/users/logout`. Logout revokes the token immediately using a MongoDB denylist with TTL cleanup. Public registration always creates `USER` accounts. Create `ADMIN` accounts only through trusted operational provisioning; `/api/users/admin/login` only accepts existing admins.

## Run both applications

```bash
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). The client status page checks `GET /api/health` through Vite's development proxy. The Express API listens on port 4000 by default. Run either app alone with `npm run dev:client` or `npm run dev:server`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test --workspace server
```

## API conventions

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code": ..., "message": ..., "details"?: ... } }`. The health check is `GET /api/health`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module boundaries and dependency direction.

# Eventora

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

Booking availability checks and confirmations use MongoDB transactions, so the database must run as a replica set (a single-node replica set is sufficient for local development). For a local MongoDB instance, start `mongod` with `--replSet rs0`, initialize it once with `mongosh --eval "rs.initiate()"`, and keep `replicaSet=rs0` in `MONGODB_URI`. Hosted MongoDB deployments should use a transaction-capable replica set or sharded cluster.

Set `JWT_SECRET` to a cryptographically random value of at least 32 characters before deploying. Signup requires a six-digit email code from `/api/users/verify-email`; login is available after verification. Access tokens expire after 15 minutes, with refresh tokens rotated in HTTP-only cookies. Create `ADMIN` accounts only through trusted operational provisioning. SMTP and Cloudinary settings are available in `server/.env.example`.

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

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

Update `server/.env` with a MongoDB connection URI when database-backed functionality is added. The server validates its environment on startup but connects to MongoDB only when `connectDatabase()` is called, so the foundation can run without MongoDB.

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
```

## API conventions

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code": ..., "message": ..., "details"?: ... } }`. The health check is `GET /api/health`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module boundaries and dependency direction.

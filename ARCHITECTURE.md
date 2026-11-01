# Backend architecture

The backend groups code by layer. Controllers handle HTTP input and output, services contain business behavior, repositories perform persistence operations, and Mongoose models define schemas. Dependencies are assembled manually in `server/src/container.ts`.

## Server

- `config/` loads environment configuration and manages the MongoDB connection.
- `controllers/`, `services/`, `repositories/`, and `models/` hold the corresponding user functionality.
- `repositories/interfaces/` contains the user and revoked-token repository contracts. `services/interfaces/` contains the password and token service contracts.
- `routes/` contains user and health routes; `middleware/`, `errors/`, `utils/`, and `validators/` contain shared request infrastructure.

The user API is mounted at `/api/users`: `POST /register`, `POST /login`, `POST /admin/login`, `GET /me`, and `POST /logout`. Services are mounted at `/api/services`; bookings are mounted at `/api/bookings`. Health is exposed at `GET /api/health`. Successful responses use `{ "success": true, "data": T }`; errors use `{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }`.

The container injects repository contracts into services and connects them to controllers and routers. Booking writes use MongoDB transactions and serialize availability checks by incrementing a version field on the service document; MongoDB must support transactions.

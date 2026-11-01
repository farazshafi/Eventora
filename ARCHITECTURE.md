# Backend architecture

The backend groups code by layer. Controllers handle HTTP input and output, services contain business behavior, repositories perform persistence operations, and Mongoose models define schemas. Dependencies are assembled manually in `server/src/container.ts`.

## Server

- `config/` loads environment configuration and manages the MongoDB connection.
- `controllers/`, `services/`, `repositories/`, and `models/` hold the corresponding user functionality.
- `repositories/interfaces/` contains the user and revoked-token repository contracts. `services/interfaces/` contains the password and token service contracts.
- `routes/` contains user and health routes; `middleware/`, `errors/`, `utils/`, and `validators/` contain shared request infrastructure.

The user API is mounted at `/api/users`: `POST /register`, `POST /login`, `POST /admin/login`, `GET /me`, and `POST /logout`. Health is exposed at `GET /api/health`. Successful responses use `{ "success": true, "data": T }`; errors use `{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }`.

Services and Bookings should be added to each relevant layer when implemented; there are no feature placeholders. The container injects repository contracts into the user service and connects the service to the controller and router.

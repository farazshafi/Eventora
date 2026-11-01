# Architecture

The repository uses npm workspaces to keep the Vite client and Express server independently configurable while sharing root-level developer tooling.

## Client

React pages compose reusable layout and UI components. Feature-specific code belongs in `features/`; `services/` owns HTTP communication; `lib/` contains shared helpers. Tailwind CSS v4 is loaded through its Vite plugin. The shadcn/ui-compatible `components/ui` location and `lib/utils.ts` utility are ready for components to be added as the product grows.

## Server

Each domain module owns its controllers, services/use cases, repository contracts and implementations, models, interfaces, validators, and routes. Controllers translate HTTP requests and responses; services own business decisions; repositories own persistence. Repository interfaces are independent of Mongoose implementations, enabling dependency injection and isolated use-case testing. Feature modules must not depend on other modules' persistence implementations.

Shared concerns live in `config/` and `core/`. The app composes middleware and routes in `app.ts`; `server.ts` validates configuration and owns process startup and database lifecycle. Errors flow to one terminal error middleware. All endpoints are mounted under `/api`; health is exposed as `GET /api/health`.

## API contract

Success: `{ "success": true, "data": T }`. Error: `{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }`. Domain modules should use these envelopes and shared error types instead of returning ad-hoc response shapes.

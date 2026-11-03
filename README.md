# Eventora

Eventora is an event-services booking platform. Customers can discover event venues and providers, check availability, and request bookings. Administrators manage service listings and approve or reject booking requests.

This repository contains two standalone applications: a React/Vite web client in `client/` and an Express API in `server/`. Install and run each from its own directory; the repository root is for documentation and shared project configuration.

## Features

- Browse and search event services by category, location, price, and availability.
- Register with email verification, sign in, and manage a profile and bookings.
- Administer service listings and booking requests through an admin workspace.
- Upload service images to Cloudinary.
- Send signup and booking status emails over SMTP.
- Protect API routes with role-based access and rotating refresh tokens.

## Technology stack

| Area           | Technologies                                                              |
| -------------- | ------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS 4                                |
| UI and forms   | React Router, TanStack Query, React Hook Form, Zod, Lucide, Framer Motion |
| Backend        | Node.js, Express 5, TypeScript                                            |
| Database       | MongoDB with Mongoose                                                     |
| Authentication | JSON Web Tokens, bcrypt, HTTP-only refresh-token cookies                  |
| Integrations   | Cloudinary for images, Nodemailer for SMTP email                          |
| Quality tools  | Vitest, ESLint, Prettier                                                  |

## Repository layout

```text
client/              React/Vite web application
  src/api/            API clients
  src/components/     Shared and feature components
  src/pages/          Customer and admin pages
  src/routes/         Route definitions and access guards
  src/contexts/       Client authentication state
server/              Express/Mongoose API
  src/config/         Environment and database setup
  src/controllers/    HTTP request handlers
  src/models/         Mongoose schemas
  src/repositories/   Database access
  src/routes/         API route definitions
  src/services/       Business logic and integrations
  tests/              Server unit and integration tests
```

## Requirements

- Node.js 22.12 (the client and server pin the Node 22 line)
- npm 10+
- MongoDB configured as a replica set (needed for booking transactions)

Cloudinary credentials are required for service image uploads. SMTP credentials and `ADMIN_EMAIL` are required for signup verification and booking notifications.

## Getting started

### 1. Install each application

In one terminal, install the API dependencies:

```bash
cd server
npm install
```

In another terminal, install the web client dependencies:

```bash
cd client
npm install
```

### 2. Configure environment files

Create local environment files from the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Edit `server/.env` and set at least:

| Variable        | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `MONGODB_URI`   | MongoDB connection string. The example uses a local `rs0` replica set. |
| `JWT_SECRET`    | Random secret with at least 32 characters.                             |
| `CLIENT_ORIGIN` | Client origin allowed by the API, usually `http://localhost:5173`.     |

To enable email, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `ADMIN_EMAIL`. To enable image uploads, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Do not commit local `.env` files or share secret values.

### 3. Start MongoDB

Booking creation and approval use MongoDB transactions, so MongoDB must run as a replica set. A local single-node setup can use replica set name `rs0`; make sure the replica set is initialized and that `MONGODB_URI` includes `replicaSet=rs0`. Hosted MongoDB must support transactions.

### 4. Run the application

Run the API from the `server/` directory:

```sh
npm run dev
```

Run the web client from the `client/` directory in a second terminal:

```sh
npm run dev
```

The Vite client is normally available at [http://localhost:5173](http://localhost:5173), and the API listens on port `4000`. During local development, Vite proxies `/api` requests to the API.

## Deploy the web client to Vercel

Import this repository in Vercel and set the **Root Directory** to `client`. Use the Vite framework preset, `npm install` as the install command, `npm run build` as the build command, and `dist` as the output directory. The client has its own package manifest and lockfile, including TypeScript and Vite's platform-specific optional packages, so it can install and build independently.

The API in `server/` must be deployed separately. Set the Vercel environment variable `VITE_API_BASE_PATH` to the deployed API URL ending in `/api` (for example, `https://your-api.example.com/api`). Keep its default value `/api` for local development with the Vite proxy.

## Admin access

Public registration creates customer accounts only. Admin accounts must be provisioned through a trusted operational process. Admins sign in through the admin login page.

## API overview

The API base path is `/api`.

| Path              | Purpose                                                                             |
| ----------------- | ----------------------------------------------------------------------------------- |
| `GET /api/health` | API and database health                                                             |
| `/api/users`      | Register, verify email, log in, refresh tokens, and manage the current user session |
| `/api/services`   | Browse services; authenticated admins manage services and upload images             |
| `/api/bookings`   | Create and manage customer bookings; admins review and update booking status        |

Successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "error": { "code": ..., "message": ... } }`.

## Project scripts

Run client commands from `client/`:

```bash
npm run typecheck
npm run build
```

Run server commands from `server/`:

```bash
npm run typecheck
npm run build
npm test
```

For architecture and backend module boundaries, see [ARCHITECTURE.md](./ARCHITECTURE.md).

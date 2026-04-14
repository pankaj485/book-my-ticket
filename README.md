# Book My Ticket

A cinema seat booking backend built with Node.js, Express, and PostgreSQL. Users register and sign in to book seats for a showing. Seats are protected against double-booking using row-level locking.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup from Scratch](#setup-from-scratch)
- [API Endpoints](#api-endpoints)
- [Example Payloads](#example-payloads)
- [Frontend Pages](#frontend-pages)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js v5 |
| Database | PostgreSQL 17 |
| DB Driver | node-postgres (`pg`) — raw SQL, no ORM |
| Auth | JWT (jsonwebtoken) — access + refresh tokens |
| Validation | Zod |
| Password Hashing | SHA-256 via Node `crypto` |
| Container | Docker / Docker Compose |

---

## Project Architecture

```
book-my-ticket/
├── index.mjs                        # App entry point, route registration
├── index.html                       # Booking UI (served at /)
├── public/
│   ├── signin.html                  # Sign in page
│   └── signup.html                  # Sign up page
├── scripts/
│   └── setup-db.mjs                 # Creates tables and seeds 30 seats
└── src/
    ├── common/
    │   ├── apierror.mjs             # ApiResponse static class (all HTTP responses)
    │   └── jwt.mjs                  # generateToken, verifyToken, genrateHash
    ├── db/
    │   ├── db.config.mjs            # pg connection pool
    │   └── schema.sql               # Table definitions (source of truth)
    ├── middlewares/
    │   └── auth.middleware.mjs      # validateUserAuth — verifies Bearer token, sets req.user
    └── modules/
        ├── auth/
        │   ├── auth.controller.mjs  # signup, signin handlers
        │   ├── auth.service.mjs     # DB queries for users
        │   └── auth.route.mjs       # POST /auth/signup, POST /auth/signin
        └── booking/
            ├── booking.controller.mjs  # getSeats, bookSeat handlers
            └── booking.service.mjs     # getAllSeats, bookSeatIfAvailable
```

### Request Flow

```
Request
  └── index.mjs (route match)
        └── validateUserAuth middleware (protected routes only)
              └── Controller (Zod validation, orchestration)
                    └── Service (SQL queries via pg pool)
                          └── PostgreSQL
```

### Auth Flow

```
POST /auth/signin
  └── Returns access_token (15 min) + refresh_token (24 h)
        └── refresh_token stored in users.refresh_token column
              └── access_token used as Bearer token on all protected routes
```

### Booking Race-Condition Prevention

`bookSeatIfAvailable` in `booking.service.mjs` runs the availability check and the update inside a **single transaction** using `SELECT ... FOR UPDATE`. This row-level lock prevents two simultaneous requests from booking the same seat.

```
BEGIN
  SELECT * FROM seats WHERE id = $1 FOR UPDATE  ← acquires row lock
  → if isbooked = true  → ROLLBACK, return { error: "already_booked" }
  → if no row found     → ROLLBACK, return { error: "not_found" }
  UPDATE seats SET isbooked = TRUE, user_id = $2 WHERE id = $1
COMMIT
```

---

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Docker](https://www.docker.com) and Docker Compose

---

## Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your_secret_key_here

# Optional — these default to the docker-compose values if omitted
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=bookmyticket

PORT=8080
```

---

## Setup from Scratch

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd book-my-ticket
npm install
```

### 2. Create the `.env` file

```bash
cp .env.example .env   # or create manually as shown above
```

### 3. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 17 container named `cc-bmt-hackathon` on port `5432` with a persistent volume.

### 4. Create tables and seed seats

```bash
npm run db:setup
```

This script:
- Creates the `users` table (if it doesn't exist)
- Creates the `seats` table (if it doesn't exist)
- Inserts 30 unbooked seats with no linked user (skipped if rows already exist)

Expected output:
```
users table ready
seats table ready
30 seats seeded

Database setup complete.
```

### 5. Start the server

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:8080`.

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/signin` | Sign in, receive tokens |

### Protected (requires `Authorization: Bearer <access_token>`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/seats` | Get all seats with booking status |
| `PUT` | `/:id/:name` | Book a specific seat |

---

## Example Payloads

### `POST /auth/signup`

**Request**
```json
{
  "email": "john@example.com",
  "password": "secret123",
  "first_name": "John",
  "last_name": "Doe",
  "age": 25
}
```

**Success `201`**
```json
{
  "message": "Sign-up successful",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "age": 25
  }
}
```

**Validation failure `400`** — password too short
```json
{
  "message": "Validation failed",
  "data": [
    {
      "message": "Password should be at least 6 characters long",
      "path": ["password"]
    }
  ]
}
```

**Validation failure `400`** — underage user
```json
{
  "message": "Validation failed",
  "data": [
    {
      "message": "You must be at least 18 years old to sign up",
      "path": ["age"]
    }
  ]
}
```

**Duplicate email `400`**
```json
{
  "message": "User with this email already exists",
  "data": null
}
```

---

### `POST /auth/signin`

**Request**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success `200`**
```json
{
  "message": "Sign-in successful",
  "data": {
    "userData": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "age": 25
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Wrong password `400`**
```json
{
  "message": "Invalid email or password",
  "data": null
}
```

**Non-existent email `400`**
```json
{
  "message": "Invalid email or password",
  "data": null
}
```

---

### `GET /seats`

**Headers**
```
Authorization: Bearer <access_token>
```

**Success `200`**
```json
{
  "message": "seats data fetched",
  "data": [
    {
      "id": 1,
      "isbooked": false,
      "email": null,
      "first_name": null
    },
    {
      "id": 2,
      "isbooked": true,
      "email": "john@example.com",
      "first_name": "John"
    }
  ]
}
```

**Missing or invalid token `401`**
```json
{
  "message": "Authorization token not provided"
}
```

```json
{
  "message": "Invalid token"
}
```

---

### `PUT /:id/:name`

Books seat with the given `id`. The `:name` parameter is the display name shown on the booking UI.

**Example** — book seat 5 as "Alice":
```
PUT /5/Alice
Authorization: Bearer <access_token>
```

**Success `201`**
```json
{
  "message": "Seat booked by: john@example.com",
  "data": null
}
```

**Seat already booked `400`**
```json
{
  "message": "Requested seat already booked.",
  "data": null
}
```

**Seat ID does not exist `400`**
```json
{
  "message": "Requested seat not available.",
  "data": null
}
```

**Invalid seat ID (non-numeric) `400`**
```json
{
  "message": "Invalid data",
  "data": [
    {
      "message": "Expected number, received nan",
      "path": ["id"]
    }
  ]
}
```

**Missing token `401`**
```json
{
  "message": "Authorization token not provided"
}
```

---

## Frontend Pages

All pages share the same dark cinema theme.

| Route | File | Description |
|---|---|---|
| `/` | `index.html` | Seat grid — redirects to `/signin` if no token in `localStorage` |
| `/signin` | `public/signin.html` | Sign in form — redirects to `/` on success |
| `/signup` | `public/signup.html` | Registration form — redirects to `/signin` on success |

Token is stored in `localStorage` as `access_token`. Sign Out clears `localStorage` and redirects to `/signin`. If the server returns `401` on any booking request, the user is signed out automatically.

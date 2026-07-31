# FinTrack — Week Capstone

Personal finance tracker backend. Users hold multiple accounts, log transactions against them, and tag each transaction with a category.

## Live Demo

Check it out here: [https://fintrack-production-leon.up.railway.app/api/v1]

## ERD

![FinTrack ERD](docs/erd.svg)

- `users (1) — (many) accounts` via `accounts.user_id`
- `accounts (1) — (many) transactions` via `transactions.account_id`
- `categories (1) — (many) transactions` via `transactions.category_id`

---

## Project Structure

```
src/
  users/          # users module (CRUD)
  accounts/       # accounts module (CRUD, linked to users)
  categories/     # categories module (CRUD)
  transactions/   # transactions module (CRUD + atomic balance recalculation)
  prisma/         # PrismaService and PrismaModule
db/
  schema.sql      # DDL — 4 tables, PKs, FKs, CHECK constraints, indexes
  seed.sql        # 3 users, 6 accounts, 7 categories, 24 transactions
  queries.sql     # 9 analytical SQL queries
prisma/
  schema.prisma   # Prisma schema (PostgreSQL)
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later running locally

---

## 1. Clone and install dependencies

```bash
git clone <repository-url>
cd milestone-4-leogurning
npm install
```

---

## 2. Set up environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env   # if an example file exists, otherwise create it manually
```

Add the following variables:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>"
PORT=3001
NODE_ENV=development
```

Replace `<user>`, `<password>`, and `<database>` with your actual PostgreSQL credentials.

**Example:**

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/fintrack"
PORT=3001
NODE_ENV=development
```

---

## 3. Set up the database

### 3a. Create the database

Open a PostgreSQL shell and create the database if it does not exist:

```bash
psql -U postgres -c "CREATE DATABASE fintrack;"
```

### 3b. Apply the schema (DDL)

This creates all tables, constraints, and indexes from scratch. Re-running it will drop and recreate all tables.

```bash
psql -U postgres -d fintrack -f db/schema.sql
```

### 3c. Seed sample data

Inserts 3 users, 6 accounts, 7 categories, and 24 transactions:

```bash
psql -U postgres -d fintrack -f db/seed.sql
```

### 3d. (Optional) Run the analytical queries

Nine pre-written SQL queries covering joins, aggregations, CTEs, and window functions:

```bash
psql -U postgres -d fintrack -f db/queries.sql
```

> **Load order:** `schema.sql` → `seed.sql` → `queries.sql`

---

## 4. Generate the Prisma client

```bash
npx prisma generate
```

This generates the typed Prisma client into `generated/prisma/` based on `prisma/schema.prisma`.

> **Note:** The project uses `@prisma/adapter-pg` (driver adapter). Do **not** run `prisma migrate` — the schema is managed via the raw SQL files in `db/`.

---

## 5. Run the application

### Development (watch mode)

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

The server starts on `http://localhost:3001` by default (configurable via the `PORT` env variable).

---

## 6. API documentation (Swagger)

Once the server is running, open:

```
http://localhost:3001/api/docs
```

All endpoints are documented with request bodies, parameters, and response codes.

---

## 7. API endpoints overview

All routes are prefixed with `/api/v1`.

### Users — `/api/v1/users`

| Method | Path   | Description    |
| ------ | ------ | -------------- |
| GET    | `/`    | List all users |
| GET    | `/:id` | Get user by ID |
| POST   | `/`    | Create a user  |
| PATCH  | `/:id` | Update a user  |
| DELETE | `/:id` | Delete a user  |

### Accounts — `/api/v1/accounts`

| Method | Path            | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/`             | List all accounts         |
| GET    | `/user/:userId` | Get accounts by user ID   |
| GET    | `/:id`          | Get account by ID         |
| POST   | `/user/:userId` | Create account for a user |
| PATCH  | `/:id`          | Update an account         |
| DELETE | `/:id`          | Delete an account         |

### Categories — `/api/v1/categories`

| Method | Path   | Description                                            |
| ------ | ------ | ------------------------------------------------------ |
| GET    | `/`    | List all categories (optional `?type=income\|expense`) |
| GET    | `/:id` | Get category by ID                                     |
| POST   | `/`    | Create a category                                      |
| PATCH  | `/:id` | Update a category                                      |
| DELETE | `/:id` | Delete a category                                      |

### Transactions — `/api/v1/transactions`

| Method | Path                  | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/`                   | List all transactions          |
| GET    | `/account/:accountId` | Get transactions by account ID |
| GET    | `/:id`                | Get transaction by ID          |
| POST   | `/`                   | Create a transaction           |
| PATCH  | `/:id`                | Update a transaction           |
| DELETE | `/:id`                | Delete a transaction           |

> Creating, updating, or deleting a transaction automatically recalculates the linked account's balance inside a single database transaction (atomic — all or nothing).

---

## 8. Available npm scripts

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `npm run start:dev`  | Start in watch mode (development) |
| `npm run start`      | Start without watch               |
| `npm run build`      | Compile TypeScript to `dist/`     |
| `npm run start:prod` | Run compiled output               |
| `npm run lint`       | Lint and auto-fix with ESLint     |
| `npm run format`     | Format code with Prettier         |
| `npm run test`       | Run unit tests                    |
| `npm run test:cov`   | Run tests with coverage report    |

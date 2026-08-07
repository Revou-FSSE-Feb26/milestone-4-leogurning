# FinTrack — Personal Finance Tracker API

A RESTful API backend for personal finance management built with NestJS, Prisma, and PostgreSQL. Users can manage multiple accounts, log income/expense transactions, and categorize spending — with automatic balance recalculation on every transaction change.

---

## Live Demo

Check it out here: [https://fintrack-production-leon.up.railway.app/api/v1]

## Live API DOC

SWAGGER API doc here: [https://fintrack-production-leon.up.railway.app/api/docs]

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    users     │       │     accounts     │       │     transactions     │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id       PK  │──┐    │ id          PK   │──┐    │ id              PK   │
│ name         │  │    │ name             │  │    │ category_id     FK   │
│ email (uniq) │  └───>│ user_id     FK   │  └───>│ account_id      FK   │
│ password     │       │ type             │       │ type                 │
│ role         │       │ balance          │       │ amount               │
│ created_at   │       │ created_at       │       │ description          │
└──────────────┘       └──────────────────┘       │ transaction_date     │
                                                  │ created_at           │
                       ┌──────────────────┐       └──────────────────────┘
                       │   categories     │                │
                       ├──────────────────┤                │
                       │ id          PK   │<───────────────┘
                       │ name             │
                       │ type             │
                       └──────────────────┘
```

**Relationships:**

- `users (1) → (many) accounts` — a user owns multiple accounts
- `accounts (1) → (many) transactions` — an account holds multiple transactions (cascade delete)
- `categories (1) → (many) transactions` — a category tags multiple transactions (restrict delete)

---

## Architecture

### Module Structure

```
AppModule
├── PrismaModule          (global DB connection)
├── AuthModule            (register, login, JWT)
├── UsersModule           (CRUD users, admin)
├── AccountsModule        (CRUD accounts, ownership-scoped)
├── CategoriesModule      (CRUD categories)
└── TransactionsModule    (CRUD transactions, ownership-scoped, balance logic)
```

Each feature module follows a **Controller → Service → Repository** pattern:

- **Controller** — handles HTTP, validation pipes, guards, and Swagger docs
- **Service** — business logic, authorization checks, error handling
- **Repository** — Prisma ORM queries, atomic `$transaction` batches

### Dependency Injection Choices

| Pattern                  | Where Used                                                                      | Why                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `useClass`               | `ThrottlerGuard` via `APP_GUARD`                                                | Registers the rate limiter globally without decorating every controller                                                       |
| `useFactory`             | `JwtModule.registerAsync({ useFactory })`                                       | Defers reading `process.env.JWT_SECRET` to runtime — avoids the decoration-time timing issue where env vars aren't loaded yet |
| Standard `@Injectable()` | All services, repositories, guards                                              | Default NestJS DI for singleton providers scoped to their module                                                              |
| Module `exports`         | `AuthModule` exports `JwtModule`; `AccountsModule` exports `AccountsRepository` | Allows dependent modules (e.g., TransactionsModule) to inject shared providers without duplicating registrations              |

### Auth Flow

```
┌─────────┐   POST /auth/register     ┌─────────────┐
│  Client │ ────────────────────────> │ AuthService │ ─── bcrypt hash ──> DB
│         │ <──────────── JWT ─────── │             │
│         │                           └─────────────┘
│         │   POST /auth/login
│         │ ────────────────────────> │ AuthService │ ─── bcrypt compare
│         │ <──────────── JWT ─────── │             │
│         │                           └─────────────┘
│         │   GET /accounts (+ Bearer token)
│         │ ────────────────────────> │ JwtAuthGuard │ ─── verify token
│         │                           │ RolesGuard   │ ─── check role
│         │ <──────── 200 data ────── │ Controller   │
└─────────┘                           └──────────────┘
```

1. **Register** — password hashed with bcrypt (12 rounds), user created, JWT returned
2. **Login** — email/password validated, JWT signed with `JWT_SECRET` (30 min expiry)
3. **Protected routes** — `JwtAuthGuard` verifies the Bearer token, attaches `req.user` (payload: `{ sub, email, role }`)
4. **Role-based access** — `RolesGuard` + `@Roles()` decorator restricts admin-only endpoints

### Cross-Cutting Concerns

- **Rate limiting** — `@nestjs/throttler` globally applied (3 req / 10s default; login has custom 5 req / 60s)
- **Request logging** — `LoggerMiddleware` writes `[METHOD] -- /path | status | duration` to `logs/request.log`
- **Security headers** — Helmet middleware
- **CORS** — configured for Railway deployment
- **Validation** — global `ValidationPipe` with whitelist + transform + forbidNonWhitelisted

---

## Project Structure

```
src/
  auth/              # Auth module (register, login, JWT guards)
    guards/          # JwtAuthGuard, RolesGuard
    dto/             # RegisterDto, LoginDto, AuthResponseDto
  users/             # Users module (CRUD)
  accounts/          # Accounts module (CRUD, ownership-scoped)
  categories/        # Categories module (CRUD)
  transactions/      # Transactions module (CRUD, ownership-scoped + atomic balance recalculation)
  common/
    decorators/      # @CurrentUser, @Roles
    middleware/      # LoggerMiddleware
  prisma/            # PrismaService, PrismaModule
db/
  schema.sql         # DDL — tables, constraints, indexes
  seed.sql           # Sample data (raw SQL)
  queries.sql        # Analytical SQL queries
prisma/
  schema.prisma      # Prisma schema
  seed.ts            # TypeScript seed (npx prisma db seed)
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [PostgreSQL](https://www.postgresql.org/) v14+ running locally

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <repository-url>
cd milestone-4-leogurning
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fintrack"

# Application
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# JWT
JWT_SECRET=your-secret-key-here
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE DATABASE fintrack;"
```

### 4. Apply schema (DDL)

```bash
psql -U postgres -d fintrack -f db/schema.sql
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Seed the database

```bash
npx prisma db seed
```

This inserts 3 users, 6 accounts, 7 categories, and 24 transactions with bcrypt-hashed passwords.

**Test credentials:**

| User          | Email               | Password    | Role  |
| ------------- | ------------------- | ----------- | ----- |
| Alice Wirawan | `alice@example.com` | `alice123!` | user  |
| Budi Santoso  | `budi@example.com`  | `budi123!`  | user  |
| Citra Lestari | `citra@example.com` | `citra123!` | admin |

### 7. Run the application

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Server starts on `http://localhost:3001`.

### 8. Swagger API docs

Open in browser:

```
http://localhost:3001/api/docs
```

To test authenticated endpoints:

1. Call `POST /api/v1/auth/login` with credentials
2. Copy the `accessToken` from the response
3. Click **Authorize** (lock icon) → paste the token → click **Authorize**
4. All subsequent requests include the Bearer token

---

## API Endpoints

All routes prefixed with `/api/v1`.

### Auth — `/auth`

| Method | Path        | Description           | Auth   |
| ------ | ----------- | --------------------- | ------ |
| POST   | `/register` | Register a new user   | Public |
| POST   | `/login`    | Login and receive JWT | Public |

### Users — `/users`

| Method | Path   | Description               | Auth        |
| ------ | ------ | ------------------------- | ----------- |
| GET    | `/`    | Get current user profile  | JWT         |
| GET    | `/all` | List all users (admin)    | JWT + Admin |
| GET    | `/:id` | Get user by ID (admin)    | JWT + Admin |
| POST   | `/`    | Create a user (admin)     | JWT + Admin |
| PATCH  | `/:id` | Update login user profile | JWT         |
| DELETE | `/:id` | Delete a user (admin)     | JWT + Admin |

### Accounts — `/accounts`

| Method | Path                | Description                                       | Auth        |
| ------ | ------------------- | ------------------------------------------------- | ----------- |
| GET    | `/`                 | Get own accounts of login user                    | JWT         |
| GET    | `/all`              | List all accounts (admin)                         | JWT + Admin |
| GET    | `/user/:userId`     | Get accounts by user ID (admin)                   | JWT + Admin |
| GET    | `/:id`              | Get account by ID of login user                   | JWT         |
| GET    | `/:id/transactions` | Get account with nested transactions + categories | JWT         |
| POST   | `/user/:userId`     | Create account for login user                     | JWT         |
| PATCH  | `/:id`              | Update an account of login user                   | JWT         |
| DELETE | `/:id`              | Delete an account of login user                   | JWT         |

### Categories — `/categories`

| Method | Path   | Description                                        | Auth        |
| ------ | ------ | -------------------------------------------------- | ----------- |
| GET    | `/`    | List categories (optional `?type=income\|expense`) | JWT         |
| GET    | `/:id` | Get category by ID                                 | JWT         |
| POST   | `/`    | Create a category (admin)                          | JWT + Admin |
| PATCH  | `/:id` | Update a category (admin)                          | JWT + Admin |
| DELETE | `/:id` | Delete a category (admin)                          | JWT + Admin |

### Transactions — `/transactions`

| Method | Path                  | Description                               | Auth        |
| ------ | --------------------- | ----------------------------------------- | ----------- |
| GET    | `/`                   | Get own transactions of login user        | JWT         |
| GET    | `/all`                | List all transactions (admin)             | JWT + Admin |
| GET    | `/account/:accountId` | Get transactions by account of login user | JWT         |
| GET    | `/:id`                | Get transaction by ID of login user       | JWT         |
| POST   | `/`                   | Create transaction of login user          | JWT         |
|        |                       | (with balance check)                      |             |
| PATCH  | `/:id`                | Update transaction of login user          | JWT         |
|        |                       | (with balance recalculation)              |             |
| DELETE | `/:id`                | Delete transaction of login user          | JWT         |
|        |                       | (with balance reversal)                   |             |

> Transaction create/update/delete operations execute inside `prisma.$transaction` — all balance updates and record changes succeed or fail atomically.

---

## Available Scripts

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `npm run start:dev`  | Start in watch mode (development) |
| `npm run start`      | Start without watch               |
| `npm run build`      | Compile TypeScript to `dist/`     |
| `npm run start:prod` | Run compiled output               |
| `npm run lint`       | Lint and auto-fix with ESLint     |
| `npm run format`     | Format code with Prettier         |
| `npm run test`       | Run unit tests                    |
| `npm run test:cov`   | Run tests with coverage           |

---

## Known Limitations

- **Access token expires** — JWT expires in 30 minutes; the client must re-login. A refresh token rotation flow will be implemented later.
- **No pagination** — list endpoints return all records. For large datasets, cursor-based or offset pagination should be added.
- **No soft delete** — records are hard-deleted. Audit trails or soft-delete (via a `deletedAt` column) are not implemented.
- **Single-database deployment** — no read replicas or connection pooling configuration.
- **Rate limiter is in-memory** — throttle state resets on restart and is not shared across multiple instances. For multi-instance deployments, a Redis-backed throttler store is needed.
- **No email verification** — registration does not require email confirmation.

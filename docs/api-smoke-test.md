# API Smoke Test

One example `curl` per endpoint to verify the API works end-to-end.
All examples use the production base URL. Replace with `http://localhost:3001` for local testing.

> Full Postman collection: [`docs/Fintrack.postman_collection.json`](./Fintrack.postman_collection.json)

---

## Prerequisites

1. Seed the database (`npx prisma db seed`)
2. Obtain tokens by calling the Login endpoint below

**Base URL:**

```
https://fintrack-production-leon.up.railway.app
```

---

## 1. Auth

### Register

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alicia Wonderland",
    "email": "alicia@email.id",
    "password": "alice123!",
    "role": "user"
  }'
```

**Expected Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 4,
    "email": "alicia@email.id",
    "name": "Alicia Wonderland",
    "role": "user"
  }
}
```

### Login

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123!"
  }'
```

**Expected Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Wirawan",
    "role": "user"
  }
}
```

> Save the `accessToken` value as `$TOKEN` for subsequent requests.
> For admin endpoints, login with `citra@example.com` / `citra123!` and save as `$ADMIN_TOKEN`.

---

## 2. Users

### Get User Profile (logged-in user)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "name": "Alice Wirawan",
  "email": "alice@example.com",
  "role": "user",
  "createdAt": "2026-01-05T08:00:00.000Z"
}
```

### Get All Users (Admin only)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/users/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**

```json
[
  { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com", "role": "user", "createdAt": "..." },
  { "id": 2, "name": "Budi Santoso", "email": "budi@example.com", "role": "user", "createdAt": "..." },
  { "id": 3, "name": "Citra Lestari", "email": "citra@example.com", "role": "admin", "createdAt": "..." }
]
```

### Create User (Admin only)

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Don Ritto",
    "email": "ritto@email.id",
    "password": "gr3atRitto!23",
    "role": "user"
  }'
```

**Expected Response (201):**

```json
{
  "id": 4,
  "name": "Don Ritto",
  "email": "ritto@email.id",
  "role": "user",
  "createdAt": "2026-..."
}
```

### Update User Profile

```bash
curl -X PATCH https://fintrack-production-leon.up.railway.app/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Wirawan Sinaga",
    "email": "alice@email.com"
  }'
```

**Expected Response (200):**

```json
{
  "id": 1,
  "name": "Alice Wirawan Sinaga",
  "email": "alice@email.com",
  "role": "user",
  "createdAt": "2026-01-05T08:00:00.000Z"
}
```

### Delete User (Admin only)

```bash
curl -X DELETE https://fintrack-production-leon.up.railway.app/api/v1/users/4 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "User deleted successfully",
  "status": 203,
  "id": "4"
}
```

---

## 3. Accounts

### Get Own Accounts (logged-in user)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/accounts \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Alice Cash Wallet",
    "type": "cash",
    "balance": "500000.00",
    "createdAt": "2026-01-05T08:05:00.000Z",
    "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" }
  },
  {
    "id": 2,
    "userId": 1,
    "name": "Alice BCA Savings",
    "type": "bank",
    "balance": "15250000.00",
    "createdAt": "2026-01-05T08:06:00.000Z",
    "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" }
  }
]
```

### Get Account by ID

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/accounts/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "userId": 1,
  "name": "Alice Cash Wallet",
  "type": "cash",
  "balance": "500000.00",
  "createdAt": "2026-01-05T08:05:00.000Z",
  "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" }
}
```

### Get Account with Transactions (relational include)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/accounts/2/transactions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "id": 2,
  "userId": 1,
  "name": "Alice BCA Savings",
  "type": "bank",
  "balance": "15250000.00",
  "createdAt": "...",
  "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" },
  "transactions": [
    {
      "id": 7,
      "type": "income",
      "amount": "12000000.00",
      "description": "February salary",
      "transactionDate": "2026-02-25",
      "createdAt": "...",
      "category": { "id": 1, "name": "Salary", "type": "income" }
    }
  ]
}
```

### Get All Accounts (Admin only)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/accounts/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Array of all 6 accounts across all users.

### Get Accounts by User ID (Admin only)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/accounts/user/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Array of Alice's 2 accounts.

### Create Account

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gopay Alice",
    "type": "e_wallet",
    "balance": 100000
  }'
```

**Expected Response (201):**

```json
{
  "id": 7,
  "userId": 1,
  "name": "Gopay Alice",
  "type": "e_wallet",
  "balance": "100000.00",
  "createdAt": "...",
  "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" }
}
```

### Update Account

```bash
curl -X PATCH https://fintrack-production-leon.up.railway.app/api/v1/accounts/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Bank Saving",
    "type": "bank",
    "balance": 20000000
  }'
```

**Expected Response (200):**

```json
{
  "id": 2,
  "userId": 1,
  "name": "Alice Bank Saving",
  "type": "bank",
  "balance": "20000000.00",
  "createdAt": "...",
  "user": { "id": 1, "name": "Alice Wirawan", "email": "alice@example.com" }
}
```

### Delete Account

```bash
curl -X DELETE https://fintrack-production-leon.up.railway.app/api/v1/accounts/7 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "Account deleted successfully",
  "status": 203,
  "id": "7"
}
```

---

## 4. Categories

### Get All Categories

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/categories \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
[
  { "id": 1, "name": "Salary", "type": "income" },
  { "id": 2, "name": "Freelance", "type": "income" },
  { "id": 3, "name": "Investment Return", "type": "income" },
  { "id": 4, "name": "Groceries", "type": "expense" },
  { "id": 5, "name": "Dining Out", "type": "expense" },
  { "id": 6, "name": "Transportation", "type": "expense" },
  { "id": 7, "name": "Entertainment", "type": "expense" }
]
```

### Get Category by ID

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{ "id": 1, "name": "Salary", "type": "income" }
```

### Create Category (Admin only)

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hura-hura",
    "type": "expense"
  }'
```

**Expected Response (201):**

```json
{ "id": 8, "name": "Hura-hura", "type": "expense" }
```

### Update Category (Admin only)

```bash
curl -X PATCH https://fintrack-production-leon.up.railway.app/api/v1/categories/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salary Monthly",
    "type": "income"
  }'
```

**Expected Response (200):**

```json
{ "id": 1, "name": "Salary Monthly", "type": "income" }
```

### Delete Category (Admin only)

```bash
curl -X DELETE https://fintrack-production-leon.up.railway.app/api/v1/categories/8 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "Category deleted successfully",
  "status": 203,
  "id": "8"
}
```

---

## 5. Transactions

### Get Own Transactions (logged-in user)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):** Array of all transactions belonging to accounts owned by the logged-in user, ordered newest first.

```json
[
  {
    "id": 10,
    "type": "expense",
    "amount": "310000.00",
    "description": "Groceries",
    "transactionDate": "2026-03-08",
    "createdAt": "...",
    "account": { "id": 1, "userId": 1, "name": "Alice Cash Wallet", "type": "cash" },
    "category": { "id": 4, "name": "Groceries", "type": "expense" }
  }
]
```

### Get All Transactions (Admin only)

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/transactions/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Array of all 24 transactions across all users.

### Get Transaction by ID

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/transactions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "type": "income",
  "amount": "12000000.00",
  "description": "January salary",
  "transactionDate": "2026-01-25",
  "createdAt": "...",
  "account": { "id": 2, "userId": 1, "name": "Alice BCA Savings", "type": "bank" },
  "category": { "id": 1, "name": "Salary", "type": "income" }
}
```

### Get Transactions by Account ID

```bash
curl -X GET https://fintrack-production-leon.up.railway.app/api/v1/transactions/account/2 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):** Array of transactions for account ID 2 (Alice BCA Savings).

### Create Transaction

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 1,
    "categoryId": 7,
    "type": "expense",
    "amount": 25000,
    "description": "Ngopi2 with friends",
    "transactionDate": "2026-07-15"
  }'
```

**Expected Response (201):**

```json
{
  "id": 25,
  "type": "expense",
  "amount": "25000.00",
  "description": "Ngopi2 with friends",
  "transactionDate": "2026-07-15",
  "createdAt": "...",
  "account": { "id": 1, "userId": 1, "name": "Alice Cash Wallet", "type": "cash" },
  "category": { "id": 7, "name": "Entertainment", "type": "expense" }
}
```

> The account balance is automatically decremented by 25000.

### Create Transaction — Insufficient Balance (error case)

```bash
curl -X POST https://fintrack-production-leon.up.railway.app/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 1,
    "categoryId": 4,
    "type": "expense",
    "amount": 99999999,
    "description": "Exceeds balance",
    "transactionDate": "2026-07-15"
  }'
```

**Expected Response (400):**

```json
{
  "statusCode": 400,
  "message": "Insufficient balance. Current balance is 475000, but transaction amount is 99999999",
  "error": "Bad Request"
}
```

### Update Transaction

```bash
curl -X PATCH https://fintrack-production-leon.up.railway.app/api/v1/transactions/10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 5,
    "type": "expense",
    "amount": 75000,
    "description": "dining out with friends",
    "transactionDate": "2026-07-15"
  }'
```

**Expected Response (200):**

```json
{
  "id": 10,
  "type": "expense",
  "amount": "75000.00",
  "description": "dining out with friends",
  "transactionDate": "2026-07-15",
  "createdAt": "...",
  "account": { "id": 1, "userId": 1, "name": "Alice Cash Wallet", "type": "cash" },
  "category": { "id": 5, "name": "Dining Out", "type": "expense" }
}
```

> The account balance is recalculated: old amount reversed, new amount applied — atomically.

### Delete Transaction

```bash
curl -X DELETE https://fintrack-production-leon.up.railway.app/api/v1/transactions/10 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "Transaction deleted successfully",
  "status": 203,
  "id": "10"
}
```

> The account balance is reversed (the deleted expense amount is added back).

---

## Error Responses Reference

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Validation error or insufficient balance | `"Insufficient balance..."` |
| 401 | Missing or invalid Bearer token | `{ "statusCode": 401, "message": "Unauthorized" }` |
| 403 | Forbidden (role not allowed) | `{ "statusCode": 403, "message": "Forbidden resource" }` |
| 404 | Resource not found | `{ "statusCode": 404, "message": "Account not found" }` |
| 409 | Conflict (duplicate name/email) | `{ "statusCode": 409, "message": "User already exists" }` |
| 429 | Rate limited | `{ "statusCode": 429, "message": "ThrottlerException: Too Many Requests" }` |

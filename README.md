# FinTrack — Week Capstone

Personal finance tracker backend. Users hold multiple accounts, log transactions
against them, and tag each transaction with a category.

## 1. ERD

![FinTrack ERD](docs/erd.svg)

- `users (1) — (many) accounts` via `accounts.user_id`
- `accounts (1) — (many) transactions` via `transactions.account_id`
- `categories (1) — (many) transactions` via `transactions.category_id`

## 2. Files

| File             | Purpose                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `db/schema.sql`  | DDL — 4 tables, PKs, FKs, CHECK constraints, indexes                                                |
| `db/seed.sql`    | 3 users, 6 accounts, 7 categories, 24 transactions                                                  |
| `db/queries.sql` | 9 queries: filter, 3-table join, GROUP BY, CTE+window, LEFT JOIN, correlated subquery, and 3 extras |

Load order: `schema.sql` → `seed.sql` → `queries.sql`.

```bash
psql -d fintrack -f db/schema.sql
psql -d fintrack -f db/seed.sql
psql -d fintrack -f db/queries.sql
```

-- =========================================================
-- FinTrack — db/schema.sql
-- PostgreSQL DDL for the canonical FinTrack schema.
-- =========================================================

-- Clean slate (safe to re-run during development)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- store a bcrypt/argon2 hash, never plaintext
    role        VARCHAR(20)   NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin')),
    created_at  TIMESTAMP     NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- accounts
-- ---------------------------------------------------------
CREATE TABLE accounts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    type        VARCHAR(20)   NOT NULL
                    CHECK (type IN ('cash', 'bank', 'e-wallet')),
    balance     NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ---------------------------------------------------------
-- categories
-- NOTE: only 'income' and 'expense' exist here, but
-- transactions.type also allows 'transfer' 
-- ---------------------------------------------------------
CREATE TABLE categories (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    type    VARCHAR(20)  NOT NULL
                CHECK (type IN ('income', 'expense'))
);

-- ---------------------------------------------------------
-- transactions
-- ---------------------------------------------------------
CREATE TABLE transactions (
    id                BIGSERIAL PRIMARY KEY,
    account_id        BIGINT        NOT NULL REFERENCES accounts(id)   ON DELETE CASCADE,
    category_id       BIGINT        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type              VARCHAR(20)   NOT NULL
                          CHECK (type IN ('income', 'expense', 'transfer')),
    amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    description       TEXT,                     -- optional, no NOT NULL: not every txn needs a note
    transaction_date  DATE          NOT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account_id      ON transactions(account_id);
CREATE INDEX idx_transactions_category_id     ON transactions(category_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);

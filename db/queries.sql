-- =========================================================
-- FinTrack — db/queries.sql
-- 9 queries. Queries 1–3 are required. 4–9 are advanced.
-- =========================================================

-- 1. FILTERED SELECT
-- All expense transactions for Alice's cash wallet (account_id = 1), newest first.
SELECT id, amount, description, transaction_date
FROM transactions
WHERE account_id = 1
  AND type = 'expense'
ORDER BY transaction_date DESC;


-- 2. JOIN ACROSS 3+ TABLES
-- For every transaction: which user made it, from which account, in which category, how much.
SELECT
    u.name          AS user_name,
    a.name          AS account_name,
    c.name          AS category_name,
    t.type          AS transaction_type,
    t.amount,
    t.transaction_date
FROM transactions t
JOIN accounts   a ON a.id = t.account_id
JOIN categories c ON c.id = t.category_id
JOIN users      u ON u.id = a.user_id
ORDER BY t.transaction_date;


-- 3. GROUP BY AGGREGATION
-- Total expense amount per category per calendar month.
SELECT
    date_trunc('month', t.transaction_date)::date AS month,
    c.name                                        AS category_name,
    SUM(t.amount)                                 AS total_expense
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.type = 'expense'
GROUP BY month, c.name
ORDER BY month, total_expense DESC;


-- 4. ADVANCED: CTE + WINDOW FUNCTION
-- The single top spending category for each user (highest total expense).
WITH category_totals AS (
    SELECT
        u.id   AS user_id,
        u.name AS user_name,
        c.name AS category_name,
        SUM(t.amount) AS total_spent,
        RANK() OVER (PARTITION BY u.id ORDER BY SUM(t.amount) DESC) AS spend_rank
    FROM transactions t
    JOIN accounts   a ON a.id = t.account_id
    JOIN categories c ON c.id = t.category_id
    JOIN users      u ON u.id = a.user_id
    WHERE t.type = 'expense'
    GROUP BY u.id, u.name, c.name
)
SELECT user_name, category_name, total_spent
FROM category_totals
WHERE spend_rank = 1
ORDER BY user_name;


-- 5. LEFT JOIN — ZERO-ACTIVITY ROWS
-- Every category, including ones with no transactions at all (e.g. "Entertainment").
SELECT
    c.id,
    c.name,
    c.type,
    COUNT(t.id) AS transaction_count
FROM categories c
LEFT JOIN transactions t ON t.category_id = c.id
GROUP BY c.id, c.name, c.type
ORDER BY transaction_count ASC;


-- 6. ADVANCED: CORRELATED SUBQUERY
-- Accounts whose balance is below the average balance of that same user's accounts.
SELECT
    a.id,
    a.name,
    a.balance,
    a.user_id
FROM accounts a
WHERE a.balance < (
    SELECT AVG(a2.balance)
    FROM accounts a2
    WHERE a2.user_id = a.user_id
);


-- 7. INCOME VS EXPENSE SUMMARY PER USER
-- Total income and total expense per user, plus net (income - expense).
SELECT
    u.name AS user_name,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0)  AS total_income,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS total_expense,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0)
      - COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS net
FROM users u
JOIN accounts     a ON a.user_id = u.id
JOIN transactions t ON t.account_id = a.id
GROUP BY u.name
ORDER BY net DESC;


-- 8. WINDOW FUNCTION — RUNNING BALANCE PER ACCOUNT
-- Chronological running total of net movement (income/expense) for each account.
SELECT
    account_id,
    transaction_date,
    type,
    amount,
    SUM(
        CASE WHEN type = 'income' THEN amount ELSE -amount END
    ) OVER (PARTITION BY account_id ORDER BY transaction_date, id) AS running_net
FROM transactions
ORDER BY account_id, transaction_date, id;


-- 9. AVERAGE TRANSACTION AMOUNT BY ACCOUNT TYPE
-- Is spending behavior different on cash vs bank vs e-wallet accounts?
SELECT
    a.type              AS account_type,
    t.type              AS transaction_type,
    ROUND(AVG(t.amount), 2) AS avg_amount,
    COUNT(*)            AS num_transactions
FROM transactions t
JOIN accounts a ON a.id = t.account_id
GROUP BY a.type, t.type
ORDER BY a.type, t.type;

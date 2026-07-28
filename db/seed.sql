-- =========================================================
-- FinTrack — db/seed.sql
-- Realistic sample data: 3 users, 2 accounts each,
-- 7 categories (6 minimum + 1 deliberately unused), 24 transactions.
-- Run after schema.sql.
-- =========================================================

-- ---------------------------------------------------------
-- users (id 1-3)
-- ---------------------------------------------------------
INSERT INTO users (name, email, password, role, created_at) VALUES
('Alice Wirawan', 'alice@example.com', '$2b$10$hashplaceholder1', 'user', '2026-01-05 08:00:00'),
('Budi Santoso',  'budi@example.com',  '$2b$10$hashplaceholder2', 'user', '2026-01-06 09:15:00'),
('Citra Lestari', 'citra@example.com', '$2b$10$hashplaceholder3', 'admin', '2026-01-07 10:30:00');

-- ---------------------------------------------------------
-- accounts (id 1-6) — 2 per user
-- ---------------------------------------------------------
INSERT INTO accounts (user_id, name, type, balance, created_at) VALUES
(1, 'Alice Cash Wallet',   'cash',     500000.00,  '2026-01-05 08:05:00'),
(1, 'Alice BCA Savings',   'bank',     15250000.00,'2026-01-05 08:06:00'),
(2, 'Budi Cash Wallet',    'cash',     300000.00,  '2026-01-06 09:20:00'),
(2, 'Budi Mandiri Giro',   'bank',     9800000.00, '2026-01-06 09:21:00'),
(3, 'Citra GoPay',         'e-wallet', 750000.00,  '2026-01-07 10:35:00'),
(3, 'Citra BNI Savings',   'bank',     22300000.00,'2026-01-07 10:36:00');

-- ---------------------------------------------------------
-- categories (id 1-7)
-- ---------------------------------------------------------
INSERT INTO categories (name, type) VALUES
('Salary',           'income'),   -- 1
('Freelance',         'income'),  -- 2
('Investment Return',  'income'), -- 3
('Groceries',          'expense'),-- 4
('Dining Out',         'expense'),-- 5
('Transportation',     'expense'),-- 6
('Entertainment',      'expense');-- 7 (intentionally left with zero transactions below)

-- ---------------------------------------------------------
-- transactions (24 rows, spread across Jan-Mar 2026)
-- ---------------------------------------------------------
INSERT INTO transactions (account_id, category_id, type, amount, description, transaction_date, created_at) VALUES
-- Alice (accounts 1-2)
(2, 1, 'income',  12000000.00, 'January salary',            '2026-01-25', '2026-01-25 09:00:00'),
(1, 4, 'expense',    350000.00, 'Weekly groceries',          '2026-01-27', '2026-01-27 17:30:00'),
(1, 5, 'expense',    120000.00, 'Dinner with friends',       '2026-01-28', '2026-01-28 20:00:00'),
(2, 6, 'expense',    450000.00, 'Monthly train pass',        '2026-02-01', '2026-02-01 08:00:00'),
(1, 4, 'expense',    280000.00, 'Groceries',                 '2026-02-05', '2026-02-05 18:00:00'),
(2, 2, 'income',   2500000.00, 'Freelance design project',  '2026-02-10', '2026-02-10 14:00:00'),
(2, 1, 'income',  12000000.00, 'February salary',            '2026-02-25', '2026-02-25 09:00:00'),
(1, 5, 'expense',    200000.00, 'Coffee shop work session',  '2026-02-26', '2026-02-26 11:00:00'),
(2, 6, 'expense',    150000.00, 'Ride-hailing to airport',   '2026-03-02', '2026-03-02 06:00:00'),
(1, 4, 'expense',    310000.00, 'Groceries',                 '2026-03-08', '2026-03-08 19:00:00'),
-- Budi (accounts 3-4)
(4, 1, 'income',   9500000.00, 'January salary',             '2026-01-25', '2026-01-25 09:10:00'),
(3, 4, 'expense',    220000.00, 'Groceries',                 '2026-01-29', '2026-01-29 17:00:00'),
(3, 6, 'expense',     80000.00, 'Motorbike fuel',             '2026-01-30', '2026-01-30 07:00:00'),
(4, 3, 'income',    600000.00, 'Mutual fund dividend',       '2026-02-03', '2026-02-03 10:00:00'),
(3, 5, 'expense',    175000.00, 'Lunch out',                  '2026-02-07', '2026-02-07 12:30:00'),
(4, 1, 'income',   9500000.00, 'February salary',             '2026-02-25', '2026-02-25 09:10:00'),
(3, 4, 'expense',    260000.00, 'Groceries',                  '2026-02-27', '2026-02-27 18:15:00'),
(3, 6, 'expense',     90000.00, 'Motorbike fuel',              '2026-03-01', '2026-03-01 07:00:00'),
(4, 2, 'income',   1800000.00, 'Freelance copywriting',       '2026-03-05', '2026-03-05 15:00:00'),
-- Citra (accounts 5-6)
(6, 1, 'income',  18000000.00, 'January salary',              '2026-01-25', '2026-01-25 09:20:00'),
(5, 5, 'expense',    300000.00, 'Team dinner',                 '2026-01-31', '2026-01-31 20:30:00'),
(5, 4, 'expense',    400000.00, 'Groceries',                   '2026-02-06', '2026-02-06 17:45:00'),
(6, 1, 'income',  18000000.00, 'February salary',              '2026-02-25', '2026-02-25 09:20:00'),
(5, 6, 'expense',    130000.00, 'Ride-hailing',                 '2026-03-03', '2026-03-03 09:00:00');

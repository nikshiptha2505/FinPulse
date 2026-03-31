-- FinPulse Database Schema
-- PostgreSQL

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    created_at    TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255)    NOT NULL,
    amount      NUMERIC(15, 2)  NOT NULL,
    category    VARCHAR(100)    NOT NULL,
    type        VARCHAR(10)     NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    date        DATE            NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category  ON transactions(user_id, category);
CREATE INDEX idx_transactions_type      ON transactions(user_id, type);

CREATE TABLE budgets (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category     VARCHAR(100)   NOT NULL,
    limit_amount NUMERIC(15, 2) NOT NULL,
    month        CHAR(7)        NOT NULL, -- "2025-03"
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, category, month)
);

CREATE TABLE goals (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(150)   NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    saved_amount  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deadline      DATE           NOT NULL,
    icon          VARCHAR(8),
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

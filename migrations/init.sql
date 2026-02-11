CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('CREATED', 'PENDING_3DS', 'SUCCESS', 'FAILED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
        CREATE TYPE currency AS ENUM ('USD', 'EUR', 'GBP', 'GEL');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psp_transaction_id VARCHAR(255),
  order_id VARCHAR(255),
  amount INTEGER NOT NULL,
  card_mask VARCHAR(20) NOT NULL,
  currency currency NOT NULL,
  status transaction_status NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_psp_id ON transactions(psp_transaction_id);
-- Production Records Table
CREATE TABLE IF NOT EXISTS production_records (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  item_code VARCHAR(50) NOT NULL,
  production_line VARCHAR(50) NOT NULL,
  produced_quantity INTEGER NOT NULL CHECK (produced_quantity > 0),
  reject_quantity INTEGER NOT NULL CHECK (reject_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table for Auth
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_date ON production_records(date);
CREATE INDEX IF NOT EXISTS idx_production_item_code ON production_records(item_code);
CREATE INDEX IF NOT EXISTS idx_production_line ON production_records(production_line);

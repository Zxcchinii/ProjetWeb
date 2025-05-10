
-- Schéma de base de données pour l'application BanqueRupt
-- À exécuter manuellement après l'installation de PostgreSQL

-- Suppression des tables si elles existent
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

-- Création de la table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table accounts
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(34) UNIQUE NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
  type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table cards
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  card_number VARCHAR(19) UNIQUE NOT NULL,
  expiration_date TIMESTAMP NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  card_type VARCHAR(20) NOT NULL,
  daily_limit DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  recipient_account VARCHAR(34),
  sender_account VARCHAR(34),
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

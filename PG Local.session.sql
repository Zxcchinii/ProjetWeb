-- Table Utilisateurs (clients + employés)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('client', 'employe', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Comptes Bancaires
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(34) UNIQUE NOT NULL, -- Format IBAN
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    type VARCHAR(20) CHECK (type IN ('courant', 'epargne', 'entreprise')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Opérations/Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account INT NOT NULL REFERENCES accounts(id),
    to_account INT NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Cartes Bancaires
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    card_number VARCHAR(19) UNIQUE NOT NULL,
    expiration DATE NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('visa', 'mastercard')),
    daily_limit DECIMAL(10,2) DEFAULT 1000.00,
    blocked BOOLEAN DEFAULT false
);

-- Index pour optimiser les recherches fréquentes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_account_user ON accounts(user_id);
CREATE INDEX idx_transaction_date ON transactions(created_at);
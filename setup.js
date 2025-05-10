const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Bootstrapping project setup...');

// Fonction d'installation des dépendances
function ensureDependencies() {
  console.log('📦 Vérification des dépendances de setup...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('📝 Création du package.json initial...');
    const initialPackage = {
      "name": "banque-rupt",
      "version": "1.0.0",
      "description": "Banking application with Next.js frontend and Express backend",
      "scripts": {
        "postinstall": "node setup.js",
        "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
        "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
        "dev:backend": "cd backend && npm run dev",
        "dev:frontend": "cd frontend && npm run dev",
        "build": "cd frontend && npm run build",
        "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
        "start:backend": "cd backend && npm start",
        "start:frontend": "cd frontend && npm start"
      },
      "dependencies": {
        "concurrently": "^8.2.0",
        "inquirer": "^8.2.5",
        "chalk": "^4.1.2"
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(initialPackage, null, 2));
  }

  console.log('📥 Installation des dépendances racine...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Installation des dépendances backend
  setupBackend();
  
  // Installation des dépendances frontend
  setupFrontend();
  
  // Configuration de l'environnement
  setupEnvironment();
  
  console.log('✅ Installation des dépendances terminée avec succès!');
}

// Configuration du backend
function setupBackend() {
  console.log('📦 Configuration du backend...');
  
  // Vérifier si le dossier backend existe, sinon le créer
  if (!fs.existsSync('./backend')) {
    fs.mkdirSync('./backend', { recursive: true });
  }
  
  // Vérifier si package.json existe dans backend
  if (!fs.existsSync('./backend/package.json')) {
    const backendPkg = {
      "name": "banque-rupt-backend",
      "version": "1.0.0",
      "description": "Backend for banking application",
      "main": "server.js",
      "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
      },
      "dependencies": {
        "express": "^4.18.2",
        "pg": "^8.11.0",
        "pg-hstore": "^2.3.4",
        "sequelize": "^6.32.1",
        "bcrypt": "^5.1.0",
        "jsonwebtoken": "^9.0.0",
        "dotenv": "^16.1.4",
        "cors": "^2.8.5",
        "cookie-parser": "^1.4.6",
        "helmet": "^7.0.0"
      }
    };
    fs.writeFileSync('./backend/package.json', JSON.stringify(backendPkg, null, 2));
  }
  
  console.log('📦 Installation des dépendances backend...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  // Installation de nodemon pour le développement
  console.log('🛠 Installation de nodemon pour le développement backend...');
  execSync('cd backend && npm install nodemon --save-dev', { stdio: 'inherit' });
}

// Configuration du frontend
function setupFrontend() {
  console.log('📦 Configuration du frontend...');
  
  // Vérifier si le dossier frontend existe, sinon le créer
  if (!fs.existsSync('./frontend')) {
    fs.mkdirSync('./frontend', { recursive: true });
  }
  
  // Vérifier si package.json existe dans frontend
  if (!fs.existsSync('./frontend/package.json')) {
    const frontendPkg = {
      "name": "banque-rupt-frontend",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      "dependencies": {
        "next": "^13.4.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "axios": "^1.4.0"
      }
    };
    fs.writeFileSync('./frontend/package.json', JSON.stringify(frontendPkg, null, 2));
  }
  
  console.log('📦 Installation des dépendances frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
}

// Configuration de l'environnement
function setupEnvironment() {
  console.log('🔧 Configuration des fichiers d\'environnement...');
  
  // Créer le répertoire config si nécessaire
  if (!fs.existsSync('./backend/config')) {
    fs.mkdirSync('./backend/config', { recursive: true });
  }
  
  // Créer le fichier db.js pour la configuration
  const dbJsContent = `
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'banquerupt',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
`;
  fs.writeFileSync('./backend/config/db.js', dbJsContent);
  
  // Créer le fichier .env pour le backend s'il n'existe pas
  if (!fs.existsSync('./backend/.env')) {
    const envContent = `
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banquerupt
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=votre_secret_jwt_ultra_securise_a_changer_en_production
COOKIE_SECRET=un_autre_secret_pour_les_cookies
`;
    fs.writeFileSync('./backend/.env', envContent);
  }
  
  // Instructions PostgreSQL pour l'utilisateur
  console.log('\n\n📋 Note importante : PostgreSQL n\'a pas été installé');
  console.log('📋 Veuillez installer PostgreSQL manuellement :');
  console.log('📋 1. Téléchargez PostgreSQL 14 depuis https://www.enterprisedb.com/downloads/postgres-postgresql-downloads');
  console.log('📋 2. Installez avec le mot de passe "postgres" pour l\'utilisateur postgres');
  console.log('📋 3. Créez une base de données nommée "banquerupt"');
  console.log('📋 4. Exécutez le script schema.sql dans cette base de données');
  
  // Créer un fichier schema.sql si nécessaire
  if (!fs.existsSync('./backend/schema.sql')) {
    const schemaSql = `
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
`;
    fs.writeFileSync('./backend/schema.sql', schemaSql);
    console.log('📋 Le fichier schema.sql a été créé dans le dossier backend/');
  }
  
  console.log('\n');
}

// Lancer l'installation des dépendances
ensureDependencies();